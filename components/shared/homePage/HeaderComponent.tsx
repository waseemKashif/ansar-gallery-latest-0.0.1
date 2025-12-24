import { getDictionary, type Locale } from "@/lib/i18n";
import Header from "./header";

interface HeaderWrapperProps {
    lang: Locale;
}

const HeaderComponent = async ({ lang }: HeaderWrapperProps) => {
    const dict = await getDictionary(lang);

    return <Header dict={dict} lang={lang} />;
};

export default HeaderComponent;