import NextTopLoader from 'nextjs-toploader';


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader color="#000" />
      {children}
    </>
  );
}
