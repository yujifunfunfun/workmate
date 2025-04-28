import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { LibSQLVector } from '@mastra/core/vector/libsql';
import { embedText } from './openai-embedding';
import { MDocument } from '@mastra/rag';

// Vector Database接続インスタンスの初期化
const vectorStore = new LibSQLVector({
  connectionUrl: 'file:.db/vector.db',
});

// デフォルトのインデックス名
const DEFAULT_INDEX_NAME = 'sales_cases';
const DEFAULT_VECTOR_DIMENSION = 1536; // OpenAI text-embedding-3-small の次元数

// CSVから読み込んだデータの型
interface SalesCase {
  date: string;
  industry: string;
  dealSize: string;
  strategy: string;
  title: string;
  description: string;
  solution: string;
  outcome: string;
  createdAt: string;
  updatedAt: string;
  expectedInquiry: string;
}

/**
 * CSVファイルからデータを読み込みます
 * @param filePath CSVファイルのパス
 * @returns 読み込んだデータの配列
 */
export async function loadDataFromCSV(filePath: string): Promise<SalesCase[]> {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });
    return records as SalesCase[];
  } catch (error) {
    console.error('CSV読み込みエラー:', error);
    return [];
  }
}

/**
 * SalesCaseデータをMDocumentに変換し、チャンキングとメタデータ抽出を行います
 * @param salesCase 営業成功事例データ
 * @returns チャンキングとメタデータ抽出済みのMDocumentオブジェクト
 */
async function processSalesCaseToDocument(salesCase: SalesCase) {
  // SalesCaseデータをテキストに変換
  const salesCaseText = `
タイトル: ${salesCase.title}
説明: ${salesCase.description}
業種: ${salesCase.industry}
案件規模: ${salesCase.dealSize}
戦略: ${salesCase.strategy}
ソリューション: ${salesCase.solution}
成果: ${salesCase.outcome}
想定問い合わせ: ${salesCase.expectedInquiry}
`;

  // テキストからMDocumentを作成
  const doc = MDocument.fromText(salesCaseText);

  // チャンキングとメタデータ抽出を同時に実行
  const chunks = await doc.chunk({
    strategy: 'recursive',
    size: 512,
    overlap: 50,
    extract: {
      // タイトル抽出
      title: {
        nodes: 1,
        nodeTemplate: "この営業事例に適切なタイトルを生成してください: {context}",
        combineTemplate: "これらのタイトルを組み合わせてください: {context}"
      },

      // サマリー抽出
      summary: {
        summaries: ["self"],
        promptTemplate: "この営業事例を1-2文で簡潔に要約してください: {context}"
      },

      // 質問生成
      questions: {
        questions: 3,
        promptTemplate: "この営業事例に関する重要な質問を{numQuestions}つ生成してください: {context}",
        embeddingOnly: false
      },

      // キーワード抽出
      keywords: {
        keywords: 5,
        promptTemplate: "この営業事例から重要なキーポイントやキーワードを{maxKeywords}つ抽出してください: {context}"
      }
    }
  });

  return {
    doc,
    chunks
  };
}

/**
 * データをインデックスに登録するため、各レコードのベクトルを生成します
 * @param data 登録対象のデータ配列
 * @returns エンベディングされたデータ
 */
export async function generateEmbeddings(data: SalesCase[]) {
  console.log(`${data.length}件のデータのエンベディングを生成します...`);

  const embeddingPromises = data.map(async (item) => {
    try {
      // データをMDocumentに変換し、チャンキングとメタデータ抽出を行う
      const { doc, chunks } = await processSalesCaseToDocument(item);

      // 各チャンクごとにエンベディングを生成
      const embeddingResults = [];

      for (const chunk of chunks) {
        const embedding = await embedText(chunk.text);

        // 元のSalesCase情報とMDocumentから抽出したメタデータを結合
        embeddingResults.push({
          embedding,
          metadata: {
            text: chunk.text,
            title: item.title,
            description: item.description,
            date: item.date,
            industry: item.industry,
            dealSize: item.dealSize,
            strategy: item.strategy,
            solution: item.solution,
            outcome: item.outcome,
            expectedInquiry: item.expectedInquiry,
            // MDocumentから抽出したメタデータ
            documentTitle: chunk.metadata?.documentTitle,
            sectionSummary: chunk.metadata?.sectionSummary,
            questionsThisExcerptCanAnswer: chunk.metadata?.questionsThisExcerptCanAnswer,
            excerptKeywords: chunk.metadata?.excerptKeywords
          }
        });
      }

      return embeddingResults;
    } catch (error) {
      console.error(`エンベディングエラー (${item.title}):`, error);
      return null;
    }
  });

  const results = await Promise.all(embeddingPromises);
  // nullを除外し、二次元配列を一次元配列に変換
  return results.filter(item => item !== null).flat();
}

/**
 * インデックスを作成します（存在しない場合）
 */
export async function ensureIndexExists() {
  try {
    const indexes = await vectorStore.listIndexes();

    if (!indexes.includes(DEFAULT_INDEX_NAME)) {
      console.log(`インデックス ${DEFAULT_INDEX_NAME} を作成します...`);
      await vectorStore.createIndex({
        indexName: DEFAULT_INDEX_NAME,
        dimension: DEFAULT_VECTOR_DIMENSION,
      });
      console.log('インデックスを作成しました');
    } else {
      console.log(`インデックス ${DEFAULT_INDEX_NAME} は既に存在します`);
    }
  } catch (error) {
    console.error('インデックス作成エラー:', error);
    throw error;
  }
}

/**
 * データをベクターデータベースに登録します
 * @param embeddedData エンベディングされたデータ
 */
export async function seedVectorDatabase(embeddedData: any[]) {
  try {
    // インデックスが存在することを確認
    await ensureIndexExists();

    if (embeddedData.length === 0) {
      console.log('登録するデータがありません');
      return;
    }

    console.log(`${embeddedData.length}件のデータを登録します...`);

    // LibSQLに登録
    await vectorStore.upsert({
      indexName: DEFAULT_INDEX_NAME,
      vectors: embeddedData.map(item => item.embedding),
      metadata: embeddedData.map(item => item.metadata),
    });

    console.log('データの登録が完了しました');
  } catch (error) {
    console.error('データ登録エラー:', error);
    throw error;
  }
}

/**
 * メインの処理: CSVからデータを読み込み、ベクターデータベースに登録します
 * @param csvFilePath CSVファイルのパス
 */
export async function seedFromCSV(csvFilePath: string) {
  try {
    console.log(`CSVファイル ${csvFilePath} からデータを読み込みます...`);
    const data = await loadDataFromCSV(csvFilePath);

    if (data.length === 0) {
      console.log('CSVから読み込まれたデータがありません');
      return;
    }

    console.log(`${data.length}件のデータを読み込みました`);

    // エンベディングの生成
    const embeddedData = await generateEmbeddings(data);

    // データベースへの登録
    await seedVectorDatabase(embeddedData);

    console.log('処理が完了しました！');
  } catch (error) {
    console.error('処理中にエラーが発生しました:', error);
  }
}

/**
 * 登録されたデータを確認する
 */
export async function checkRegisteredData() {
  try {
    // インデックスの情報を取得
    const indexInfo = await vectorStore.describeIndex(DEFAULT_INDEX_NAME);
    console.log('インデックス情報:', indexInfo);

    // 簡単な検索を実行してデータが取得できるか確認
    const testVector = new Array(DEFAULT_VECTOR_DIMENSION).fill(0.1);
    const results = await vectorStore.query({
      indexName: DEFAULT_INDEX_NAME,
      queryVector: testVector,
      topK: 3,
    });

    console.log(`検索結果 (${results.length}件):`);
    results.forEach((result, index) => {
      console.log(`[${index + 1}] ${result.metadata?.title || '不明'} (スコア: ${result.score.toFixed(4)})`);

      // 抽出されたメタデータも表示
      if (result.metadata?.documentTitle) {
        console.log(`  生成タイトル: ${result.metadata.documentTitle}`);
      }
      if (result.metadata?.sectionSummary) {
        console.log(`  要約: ${result.metadata.sectionSummary}`);
      }
      if (result.metadata?.questionsThisExcerptCanAnswer) {
        console.log(`  関連質問: ${result.metadata.questionsThisExcerptCanAnswer}`);
      }
      if (result.metadata?.excerptKeywords) {
        console.log(`  キーワード: ${result.metadata.excerptKeywords}`);
      }
    });

    return results;
  } catch (error) {
    console.error('データ取得エラー:', error);
    return [];
  }
}
