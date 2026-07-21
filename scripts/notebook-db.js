/**
 * scripts/notebook-db.js
 * -----------------------------------------------------------------------
 * Armazenamento de clipes de áudio do Caderno usando IndexedDB.
 *
 * Por quê IndexedDB e não localStorage? O localStorage tem um limite
 * total de poucos MB (geralmente 5-10MB) por site, e áudio ocupa espaço
 * rapidamente. O IndexedDB é outra área de armazenamento 100% local do
 * navegador (nenhum dado sai do aparelho), mas com capacidade muito
 * maior (tipicamente centenas de MB) e feita para guardar arquivos
 * binários (Blobs) de forma eficiente.
 *
 * IMPORTANTE: os clipes de áudio gravados aqui NÃO são incluídos no
 * backup JSON (Configurações → Exportar dados). Apenas o texto das
 * notas e metadados são exportados. Se você trocar de aparelho ou
 * limpar os dados do navegador, os áudios gravados serão perdidos —
 * apenas o texto sobrevive no backup.
 * -----------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  const DB_NAME = 'auditorProIbamAudio';
  const STORE_NAME = 'clips';
  const DB_VERSION = 1;
  let dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in global)) { reject(new Error('IndexedDB indisponível neste navegador')); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function saveClip(id, blob) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getClip(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteClip(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  function isSupported() {
    return 'indexedDB' in global && 'MediaRecorder' in global && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  global.NotebookDB = { saveClip, getClip, deleteClip, isSupported };
})(window);
