import config from '../../data/accountStats.json';
import filesystem from '../../data/consoleFS.json';
import { createRiotHandler } from './handler.mjs';

function findAccount(node) {
  if (node.type === 'file') return node.provider === 'riot' ? node : undefined;
  return node.children.map(findAccount).find(Boolean);
}
const handle = createRiotHandler(config.riot, findAccount(filesystem));
export default { fetch(request, env) { return handle(request, env, caches.default); } };
