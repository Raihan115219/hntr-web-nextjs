import type { Metadata } from "next";
import { getPoolById } from "../../../lib/pools-data";
import { SITE_NAME } from "../../../lib/metadata";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { id } = await params;
  const pool = getPoolById(id);

  return {
    title: pool.shortName,
    description: `${pool.name} — co-ownership pool on ${SITE_NAME}. Target ${pool.target} ETH, ${pool.progress.toFixed(1)}% funded.`,
  };
}

export default function PoolDetailLayout({ children }: LayoutProps) {
  return children;
}
