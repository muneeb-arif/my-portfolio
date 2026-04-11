import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { buildProjectPageMetadata, getPublishedProjectForRequest } from '@/lib/publicProject';
import { ProjectShareClient } from '@/components/ProjectShareClient';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const h = await headers();
  return buildProjectPageMetadata(params.id, h);
}

export default async function ProjectSharePage({ params }: Props) {
  const h = await headers();
  const id = params.id;
  const project = await getPublishedProjectForRequest(id, h);
  if (!project) {
    notFound();
  }
  return <ProjectShareClient project={project} />;
}
