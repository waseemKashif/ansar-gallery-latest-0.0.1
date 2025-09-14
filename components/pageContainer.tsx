function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className="max-w-[1700px] mx-auto md:px-5 p-2 m-0 py-0">{children}</main>;
}
export default PageContainer;
