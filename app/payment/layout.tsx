export default function PaymentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            </head>
            <body style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#ffffff' }}>
                {children}
            </body>
        </html>
    );
}
