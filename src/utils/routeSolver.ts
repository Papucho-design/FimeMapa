import { ROUTE_NODES, ROUTE_EDGES } from '../data/routes';
import { BUILDINGS } from '../data/buildings';
import { getPhotoForTarget } from '../data/photos';
import type { NavigationStep, Room } from '../types';
import { floorWords } from './floors';
import { roomPhotoUrl, roomPhotoFallbackUrl } from './photos';

/**
 * Resolves the shortest path from startNodeId to the entrance node of the target building.
 * Uses Dijkstra's algorithm over the ROUTE_EDGES graph.
 */
export function solveRoute(
  startNodeId: string,
  targetBuildingId: string,
  targetRoomName?: string,
  targetFloor?: number,
  room?: Pick<Room, 'notes' | 'photo' | 'verified'>
): {
  pathNodeIds: string[];
  steps: NavigationStep[];
  totalDistance: number;
  estimatedMinutes: number;
} {
  // Map building ID to its corresponding route node
  const buildingNodeMap: Record<string, string> = {
    '1':     'building-1',
    '2':     'building-2',
    '3':     'building-3',
    '4':     'building-4',
    '5':     'building-5',
    '6':     'building-6',
    '7':     'building-7',
    '8':     'building-8',
    '9':     'building-9',
    '10':    'building-10',
    '11':    'building-11',
    '12':    'building-12',
    'cidet': 'building-cidet',
    'ciiia': 'building-cidet',   // fallback
  };

  const targetNodeId = buildingNodeMap[targetBuildingId] ?? `building-${targetBuildingId}`;
  const startNode    = ROUTE_NODES[startNodeId] ?? ROUTE_NODES['entrance-main'];
  const targetNode   = ROUTE_NODES[targetNodeId] ?? ROUTE_NODES['building-7'];

  // ── Build adjacency list ──────────────────────────────────────────────────
  const adj: Record<string, { node: string; dist: number; desc?: string }[]> = {};
  Object.keys(ROUTE_NODES).forEach(id => { adj[id] = []; });
  ROUTE_EDGES.forEach(edge => {
    const d = edge.distance ?? 100;
    adj[edge.from]?.push({ node: edge.to,   dist: d, desc: edge.description });
    adj[edge.to]?.push  ({ node: edge.from, dist: d, desc: edge.description });
  });

  // ── Dijkstra ─────────────────────────────────────────────────────────────
  const dist: Record<string, number>         = {};
  const prev: Record<string, string | null>  = {};
  const unvisited = new Set<string>();

  Object.keys(ROUTE_NODES).forEach(id => {
    dist[id] = Infinity;
    prev[id] = null;
    unvisited.add(id);
  });
  dist[startNode.id] = 0;

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDist = Infinity;
    unvisited.forEach(id => {
      if (dist[id] < minDist) { minDist = dist[id]; current = id; }
    });
    if (!current || minDist === Infinity) break;
    if (current === targetNode.id) break;
    unvisited.delete(current);

    for (const nb of (adj[current] ?? [])) {
      if (!unvisited.has(nb.node)) continue;
      const alt = dist[current] + nb.dist;
      if (alt < dist[nb.node]) {
        dist[nb.node] = alt;
        prev[nb.node] = current;
      }
    }
  }

  // ── Reconstruct path ─────────────────────────────────────────────────────
  const pathNodeIds: string[] = [];
  let cursor: string | null = targetNode.id;
  while (cursor) {
    pathNodeIds.unshift(cursor);
    cursor = prev[cursor];
  }
  // Fallback if no path found
  if (pathNodeIds.length === 0 || pathNodeIds[0] !== startNode.id) {
    pathNodeIds.splice(0, pathNodeIds.length, startNode.id, targetNode.id);
  }

  const buildingObj   = BUILDINGS[targetBuildingId];
  const buildingName  = buildingObj?.name ?? `Edificio ${targetBuildingId}`;
  const totalDistance = dist[targetNode.id] === Infinity ? 400 : dist[targetNode.id];
  const estimatedMinutes = Math.max(Math.round(totalDistance / 75), 2);

  // ── Generate human-readable navigation steps ──────────────────────────────
  const steps: NavigationStep[] = [];
  let stepIndex = 1;

  const friendlyNode = (nodeId: string): { title: string; instruction: string } => {
    const friendly: Record<string, { title: string; instruction: string }> = {
      'entrance-main':    { title: 'Entrada Principal FIME', instruction: 'Ingresa al campus por la entrada peatonal principal y avanza hacia el interior.' },
      'jct-south-center': { title: 'Pasillo Sur',            instruction: 'Continúa por el pasillo principal hacia el norte del campus.' },
      'jct-south-left':   { title: 'Desvío Oeste',           instruction: 'Toma el camino hacia la izquierda (oeste), en dirección al Edificio 7 y CIDET.' },
      'jct-south-right':  { title: 'Desvío Este',            instruction: 'Toma el camino hacia la derecha (este), en dirección al Edificio 1.' },
      'jct-center-main':  { title: 'Pasillo Central',        instruction: 'Llegas a la zona central del campus. Desde aquí puedes ver la Cafetería y el Edificio 2.' },
      'jct-center-east':  { title: 'Pasillo Centro-Este',    instruction: 'Sigue hacia el este para llegar a la zona del Edificio 2 y el Auditorio.' },
      'jct-west-main':    { title: 'Pasillo Oeste',          instruction: 'Avanza por el pasillo oeste, entre los Edificios 5 y 7.' },
      'jct-north-west':   { title: 'Pasillo Norte-Oeste',    instruction: 'Continúa hacia el norte, rumbo a los Edificios 6, 8 y Biblioteca.' },
      'jct-north-center': { title: 'Pasillo Norte Central',  instruction: 'Sigue por el pasillo norte hacia la zona de Edificio 3.' },
      'jct-north-east':   { title: 'Pasillo Noreste',        instruction: 'Continúa hacia el noreste, dirección Edificio 4.' },
      'jct-far-north':    { title: 'Zona Norte del Campus',  instruction: 'Llegas a la zona norte. Edificios 8 y Biblioteca están cerca.' },
      'cafeteria-node':   { title: 'Cafetería & Snack FIME', instruction: 'Pasas a un costado de la Cafetería Central. Buen punto de referencia.' },
      'landmark-auditorio': { title: 'Auditorio Jorge Urencio', instruction: 'El Auditorio está aquí. Edificio 2 está justo al norte, Edificio 1 al sur.' },
    };
    return friendly[nodeId] ?? {
      title: ROUTE_NODES[nodeId]?.name ?? nodeId,
      instruction: `Continúa hacia ${ROUTE_NODES[nodeId]?.name ?? 'el siguiente punto'}.`
    };
  };

  // Step 1: Starting point
  const startPhoto = getPhotoForTarget(startNode.id);
  const startInfo  = friendlyNode(startNode.id);
  steps.push({
    stepNumber: stepIndex++,
    totalSteps: 0,
    title: startInfo.title,
    instruction: startInfo.instruction,
    nodeId: startNode.id,
    photoUrl: startPhoto?.url,
    photoCaption: startPhoto?.caption,
  });

  // Intermediate steps
  for (let i = 1; i < pathNodeIds.length - 1; i++) {
    const nodeId = pathNodeIds[i];
    const node   = ROUTE_NODES[nodeId];
    if (!node) continue;
    const info   = friendlyNode(nodeId);
    const photo  = getPhotoForTarget(nodeId);
    steps.push({
      stepNumber: stepIndex++,
      totalSteps: 0,
      title: info.title,
      instruction: info.instruction,
      nodeId,
      landmarkName: node.name,
      photoUrl: photo?.url,
      photoCaption: photo?.caption,
    });
  }

  // Destination: arrive at building
  const bldPhoto = getPhotoForTarget(`building-${targetBuildingId}`);
  steps.push({
    stepNumber: stepIndex++,
    totalSteps: 0,
    title: `Llegada a ${buildingName}`,
    instruction: `Has llegado al ${buildingName}. Entra por la fachada principal.`,
    nodeId: targetNode.id,
    landmarkName: buildingName,
    photoUrl: bldPhoto?.url,
    photoCaption: bldPhoto?.caption ?? `Fachada de ${buildingName}`,
  });

  // Floor step (0 = planta baja / nivel 0; el piso 1 es el de entrada y no lleva paso extra)
  if (targetFloor !== undefined && targetFloor !== 1) {
    const where = floorWords(targetFloor);
    steps.push({
      stepNumber: stepIndex++,
      totalSteps: 0,
      title: targetFloor === 0 ? 'Ve a la planta baja (nivel 0)' : `Sube al ${where}`,
      instruction:
        targetFloor === 0
          ? `Busca el acceso al nivel 0 (planta baja) del ${buildingName}.`
          : `Utiliza las escaleras del ${buildingName} para llegar al ${where}.`,
      nodeId: targetNode.id,
      floorInfo: targetFloor === 0 ? 'Nivel 0' : `Piso ${targetFloor}`,
    });
  }

  // Final room
  if (targetRoomName) {
    const note = room?.notes?.trim();
    const preliminary = room && !room.verified ? ' La ubicación exacta aún no está verificada: si no lo ves, pregunta en el pasillo.' : '';
    steps.push({
      stepNumber: stepIndex++,
      totalSteps: 0,
      title: `Buscar Salón ${targetRoomName}`,
      instruction: note
        ? `${note.replace(/\.?$/, '.')} Busca la placa del salón ${targetRoomName}.${preliminary}`
        : `Avanza por el pasillo y busca la placa del salón ${targetRoomName}.${preliminary}`,
      nodeId: targetNode.id,
      photoUrl: roomPhotoUrl(room?.photo),
      photoFallbackUrl: roomPhotoFallbackUrl(room?.photo),
      photoCaption: room?.photo ? `Así se ve el salón ${targetRoomName}` : undefined,
      isDestination: true,
    });
  }

  const finalTotal = steps.length;
  steps.forEach(s => { s.totalSteps = finalTotal; });

  return { pathNodeIds, steps, totalDistance, estimatedMinutes };
}
