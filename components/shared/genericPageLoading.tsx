
import PageContainer from "../pageContainer";

const GenericPageLoading = () => {
    return (
        <PageContainer>
            <div className="flex flex-col gap-4 max-w-[1600px] mx-auto md:p-8 p-2">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-6">
                    <div className="skeleton-box w-48 h-8"></div>
                    <div className="skeleton-box w-96 h-8 hidden md:block"></div>
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, index) => (
                        <div key={index} className="flex flex-col gap-2">
                            <div className="skeleton-box w-full h-[250px] rounded-lg"></div>
                            <div className="skeleton-box w-3/4 h-4"></div>
                            <div className="skeleton-box w-1/2 h-4"></div>
                        </div>
                    ))}
                </div>
            </div>
        </PageContainer>
    );
};

export default GenericPageLoading;
