/* Compatibilidade: este arquivo não altera mais a Home.
   Mantém somente a recuperação de falhas temporárias da Competição. */
(() => {
  'use strict';

  if (window.FixaCompetitionFetchRecovery) return;
  window.FixaCompetitionFetchRecovery = true;

  const RETRYABLE_ERROR = /failed to fetch|networkerror|network request failed|load failed|fetch failed/i;
  const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  function isRetryable(error) {
    return RETRYABLE_ERROR.test(String(error?.message || error || ''));
  }

  function wrapSupabaseRpc() {
    const client = window.supabaseClient;
    if (!client || typeof client.rpc !== 'function') return false;
    if (client.__fixaRpcRetryWrapped) return true;

    const originalRpc = client.rpc.bind(client);
    client.rpc = async function fixaRpcWithRetry(functionName, parameters, options) {
      let result;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          result = await originalRpc(functionName, parameters, options);
        } catch (error) {
          result = { data: null, error };
        }
        if (!result?.error || !isRetryable(result.error) || attempt === 2) return result;
        await sleep(500 * (2 ** attempt));
      }
      return result;
    };

    Object.defineProperty(client, '__fixaRpcRetryWrapped', {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    });
    return true;
  }

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (wrapSupabaseRpc() || attempts >= 20) window.clearInterval(timer);
  }, 500);
  wrapSupabaseRpc();

  function competitionTab() {
    return document.querySelector('[data-competition-view="v3"]');
  }

  function retryCompetition() {
    competitionTab()?.click();
  }

  function replaceTechnicalError() {
    const root = document.querySelector('.competition-v3.active #cv3');
    if (!root || root.querySelector('[data-competition-retry]')) return;
    if (!RETRYABLE_ERROR.test((root.textContent || '').trim())) return;

    root.innerHTML = `
      <div class="cv3-card" style="display:grid;gap:12px;justify-items:start">
        <h3 style="margin:0">Não foi possível carregar a competição</h3>
        <p class="cv3-muted" style="margin:0">A conexão com o servidor falhou temporariamente. Seus dados não foram apagados.</p>
        <button type="button" data-competition-retry>Tentar novamente</button>
      </div>
    `;
    root.querySelector('[data-competition-retry]')?.addEventListener('click', retryCompetition);
  }

  let scheduled = false;
  function scheduleRecovery() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      wrapSupabaseRpc();
      replaceTechnicalError();
    });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-competition-view="v3"], .competition-v3 button, .competition-v3 select')) {
      window.setTimeout(scheduleRecovery, 80);
    }
  });

  window.addEventListener('online', () => {
    if (document.querySelector('[data-competition-retry]')) retryCompetition();
  });

  window.addEventListener('load', scheduleRecovery, { once:true });
  scheduleRecovery();
})();
