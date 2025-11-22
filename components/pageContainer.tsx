function PageContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return <main className={`max-w-[1600px] mx-auto m-0 px-2 lg:px-4 ${className}`}>{children}</main>;
}
export default PageContainer;
