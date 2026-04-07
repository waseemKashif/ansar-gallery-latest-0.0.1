function PageContainer({ children, className, title }: { children: React.ReactNode, className?: string, title?: string }) {
  return <div className={`max-w-[1600px] mx-auto m-0 px-2 lg:px-4 ${className}`} title={title}>{children}</div>;
}
export default PageContainer;
