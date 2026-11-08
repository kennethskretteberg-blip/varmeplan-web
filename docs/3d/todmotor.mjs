// 219: den EKTE 2D-motoren i Node. Tak-blokkene (204–215) skjæres ut av index.html og kjøres i en vm med stubber for
// tegning og lagring. Da sammenlignes 3D med koden appen faktisk bruker, ikke med en kopi som kan bli gammel.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FRA = '// ═══ 204 · TAK-MODULEN';
const TIL = 'async function _takRegressionTest212';
const UT = ['_takManual', '_takSetRoofType', '_takSetHeight', '_takAddGutter', '_takAddDownspout', '_takAddValley', '_takSetDownspout', '_takSetRuns',
  '_takSetEdgeType', '_takAddGuard', '_takAddObject', '_takSetObj', '_takFlatAddDrain', '_takFlatSet', '_takFlatAddValley', '_takFlatAddField', '_takFlatSetCable', '_takFlatSetSetup',
  '_takRecalc', '_takFlatRecalc', '_takCableSummary', '_takCableRows', '_takFlatSummary', '_takFlatDrainCable', '_takGuardLine', '_takGuardSummary', '_takSectionModel', '_takFeat_', '_takOf',
  '_takAddRidge', '_takSetRidgeHeight', '_takLinkEave', '_takRemoveEdgeLine', '_takRidgeMissing', '_takRidgeCardHtml', '_takRidgeFill', '_takPitch', '_takSurface'];

export function lastTodMotor() {
  const kilde = fs.readFileSync(path.join(ROT, 'index.html'), 'utf8');
  const a = kilde.indexOf(FRA), b = kilde.indexOf(TIL);
  if (a < 0 || b < a) throw new Error('Fant ikke tak-blokkene i index.html');
  const kabel = { id: 921201, name: 'InSnow 30T 1000W 33m', product_family: 'InSnow 30T', voltage: 230, category_id: 1, active: true, cable_length_m: 33, watt_per_m: 30, total_effect_w: 1000, min_spacing_mm: 60, max_spacing_mm: 200 };
  const S = { tak: {}, ui: { readOnly: false }, floors: [], project: { parts: [] } };
  const ingen = () => {};
  const ctx = vm.createContext({
    S, document: { addEventListener: ingen, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null }, window: { addEventListener: ingen }, console, Math, JSON, Object, Array, Number, String, Map, Set, RegExp, isFinite, parseFloat, Date,
    pushUndo: ingen, renderSidebar: ingen, updateCtxBar: ingen, render: ingen, hideCtx: ingen, _scheduleAutoSave: ingen, _showToast: ingen, _lockToast: ingen, confirm: () => true,
    _listCableProducts: () => [kabel], HEATING_PRODUCTS: [kabel], PRODUCT_CATEGORIES: [{ id: 1, available_contexts: ['outdoor'] }],
    _moduleContext: () => ({ wm2Max: 450 }), _ccLimits: () => ({ minSp: 6, maxSp: 20 }), _ccOverWarn: () => false, _ccWarnText: () => '',
  });
  vm.runInContext(kilde.slice(a, b) + `\n;globalThis.__tak = { ${UT.join(', ')} };`, ctx, { filename: 'index.html[tak]' });
  const m = ctx.__tak;
  const FID = 1;
  return {
    ...m, FID, S,
    /** Nytt tak fra hjørner (verdens-cm), slik «tegn selv» lager det. */
    nyttTak(pts) { S.tak = { [FID]: m._takManual(pts, { method: 'free' }) }; return m._takOf(FID); },
    /** Setter inn en kopi av lagrede data og kjører 2D-motorens egen utregning. */
    regnUt(tak) { const t = JSON.parse(JSON.stringify(tak)); S.tak = { [FID]: t }; m._takRecalc(t); m._takFlatRecalc(t); return t; },
    ren: o => JSON.parse(JSON.stringify(o)),
  };
}
