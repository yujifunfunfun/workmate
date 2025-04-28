// Prismaを使用したデータ操作サンプルスクリプト
import { PrismaClient } from '@prisma/client';

async function main() {
  // Prismaクライアントの初期化
  const prisma = new PrismaClient();
  
  try {
    // データベース接続
    await prisma.$connect();
    console.log('データベースに接続しました');

    // ユーザーサンプルデータの作成
    const sampleUser = await prisma.user.create({
      data: {
        username: 'sample_user',
        password: 'hashed_password_here',
        email: 'sample@example.com',
        last_name: 'サンプル',
        first_name: 'ユーザー'
      }
    });
    
    console.log('サンプルユーザーを作成しました:', sampleUser);

    // すべてのユーザーを取得
    const allUsers = await prisma.user.findMany();
    console.log('すべてのユーザー:', allUsers);

    // MastraEvalサンプルデータの作成
    const sampleEval = await prisma.mastraEval.create({
      data: {
        input: 'サンプル入力',
        output: 'サンプル出力',
        result: 'サンプル結果',
        agent_name: 'サンプルエージェント',
        metric_name: 'サンプルメトリック',
        instructions: 'サンプル指示',
        test_info: 'サンプルテスト情報',
        global_run_id: 'sample-global-run-id',
        run_id: 'sample-run-id'
      }
    });
    
    console.log('サンプル評価を作成しました:', sampleEval);

    // すべての評価を取得
    const allEvals = await prisma.mastraEval.findMany();
    console.log('すべての評価:', allEvals);

    // MastraTraceサンプルデータの作成
    const sampleTrace = await prisma.mastraTrace.create({
      data: {
        name: 'サンプルトレース',
        traceId: 'sample-trace-id',
        scope: 'sample-scope',
        kind: 1,
        startTime: BigInt(Date.now()),
        endTime: BigInt(Date.now() + 1000)
      }
    });
    
    console.log('サンプルトレースを作成しました:', sampleTrace);

    // LikedMessageサンプルデータの作成
    const sampleLikedMessage = await prisma.likedMessage.create({
      data: {
        resourceId: 'sample-resource-id',
        threadId: 'sample-thread-id',
        messageId: 'sample-message-id',
        userId: sampleUser.id,
        likedBy: sampleUser.id
      }
    });
    
    console.log('サンプルいいねを作成しました:', sampleLikedMessage);

    // 作成したサンプルデータをクリーンアップ
    await prisma.likedMessage.deleteMany();
    await prisma.mastraTrace.deleteMany();
    await prisma.mastraEval.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('サンプルデータをクリーンアップしました');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // 接続を閉じる
    await prisma.$disconnect();
  }
}

main(); 
