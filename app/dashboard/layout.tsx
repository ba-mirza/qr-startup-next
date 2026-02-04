import { Metadata } from "next";

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <>{children}</>;
};

export default DashboardLayout;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
