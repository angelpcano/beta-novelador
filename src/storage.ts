import { del, get, set } from 'idb-keyval';
import type { Project, Workspace } from './types';

const WORKSPACE_KEY = 'novelador-workspace-v1';
const LEGACY_KEY = 'novelador-project-v1';
const accountKey = (userId: string) => `${WORKSPACE_KEY}-user-${userId}`;

function normalizeProject(project: Project): Project {
  return {
    ...project,
    id: project.id || crypto.randomUUID(),
    name: project.name === 'Mi primera novela' ? 'Fiambre' : project.name,
    research: project.research ?? [],
    mapNotes: project.mapNotes ?? [],
    mapConnections: project.mapConnections ?? [],
    theme: project.theme ?? 'light',
    targetLength: project.targetLength ?? 'medium',
    customTarget: project.customTarget ?? 52370,
    activeSeconds: project.activeSeconds ?? 0,
  };
}

export async function loadWorkspace(userId?: string): Promise<Workspace | null> {
  const key = userId ? accountKey(userId) : WORKSPACE_KEY;
  let savedWorkspace = await get<Workspace | null>(key);
  if (!savedWorkspace && userId) {
    savedWorkspace = await get<Workspace | null>(WORKSPACE_KEY);
    if (savedWorkspace) {
      await set(key, savedWorkspace);
      await del(WORKSPACE_KEY);
    }
  }
  if (savedWorkspace?.projects?.length) {
    const projects = savedWorkspace.projects.map(normalizeProject);
    return {
      projects,
      activeProjectId: projects.some(p => p.id === savedWorkspace.activeProjectId)
        ? savedWorkspace.activeProjectId
        : projects[0].id,
      deletedProjectIds: savedWorkspace.deletedProjectIds ?? [],
    };
  }

  const legacyProject = await get<Project | null>(LEGACY_KEY);
  if (!legacyProject) return null;
  const project = normalizeProject(legacyProject);
  const workspace = { projects: [project], activeProjectId: project.id };
  await set(key, workspace);
  await del(LEGACY_KEY);
  return workspace;
}

export async function saveWorkspace(workspace: Workspace, userId?: string): Promise<void> {
  await set(userId ? accountKey(userId) : WORKSPACE_KEY, workspace);
}
