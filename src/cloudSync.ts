import type { Project } from './types';
import { supabase } from './supabase';

export async function loadCloudProjects(userId: string): Promise<{ projects: Project[]; deletedProjectIds: string[] }> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase
    .from('novels')
    .select('id, title, project_data, updated_at')
    .eq('user_id', userId);

  if (error) throw error;

  const projects: Project[] = [];
  const deletedProjectIds: string[] = [];
  for (const row of data ?? []) {
    const projectData = row.project_data as (Project & { __novelador_deleted?: boolean }) | null;
    if (projectData?.__novelador_deleted) {
      deletedProjectIds.push(row.id);
      continue;
    }
    const project = projectData;
    if (!project || !Array.isArray(project.chapters) || !Array.isArray(project.characters)) {
      throw new Error(`El proyecto "${row.title}" tiene datos incompletos en la nube.`);
    }
    projects.push({
      ...project,
      id: row.id,
      name: row.title,
      updatedAt: project.updatedAt || row.updated_at,
      research: project.research ?? [],
      mapNotes: project.mapNotes ?? [],
      mapConnections: project.mapConnections ?? [],
    });
  }
  return { projects, deletedProjectIds };
}

export async function saveCloudProjects(userId: string, projects: Project[], deletedProjectIds: string[] = []): Promise<void> {
  if (!supabase) throw new Error('Supabase no está configurado.');

  if (projects.length > 0) {
    const rows = projects.map(project => ({
      id: project.id,
      user_id: userId,
      title: project.name,
      project_data: project,
      updated_at: project.updatedAt,
    }));
    const { error } = await supabase.from('novels').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }

  const projectIds = new Set(projects.map(project => project.id));
  const idsToDelete = deletedProjectIds.filter(id => !projectIds.has(id));
  if (idsToDelete.length > 0) {
    const { error } = await supabase
      .from('novels')
      .update({ project_data: { __novelador_deleted: true }, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('id', idsToDelete);
    if (error) throw error;
  }
}

export function mergeProjects(localProjects: Project[], cloudProjects: Project[]): Project[] {
  const merged = new Map(localProjects.map(project => [project.id, project]));
  for (const cloudProject of cloudProjects) {
    const localProject = merged.get(cloudProject.id);
    if (!localProject || Date.parse(cloudProject.updatedAt) > Date.parse(localProject.updatedAt)) {
      merged.set(cloudProject.id, cloudProject);
    }
  }
  return [...merged.values()];
}
