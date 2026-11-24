import type { Project } from './types';
import { supabase } from './supabase';

export async function loadCloudProjects(userId: string): Promise<Project[]> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase
    .from('novels')
    .select('id, title, project_data, updated_at')
    .eq('user_id', userId);

  if (error) throw error;

  return (data ?? []).map(row => {
    const project = row.project_data as Project;
    if (!project || !Array.isArray(project.chapters) || !Array.isArray(project.characters)) {
      throw new Error(`El proyecto "${row.title}" tiene datos incompletos en la nube.`);
    }
    return {
      ...project,
      id: row.id,
      name: row.title,
      updatedAt: project.updatedAt || row.updated_at,
      research: project.research ?? [],
      mapNotes: project.mapNotes ?? [],
      mapConnections: project.mapConnections ?? [],
    };
  });
}

export async function saveCloudProjects(userId: string, projects: Project[]): Promise<void> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  if (projects.length === 0) return;

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
