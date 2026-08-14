(() => {
  'use strict';
  if (window.FixaHomeGoalsStreakProtectionV2) return;
  window.FixaHomeGoalsStreakProtectionV2 = true;

  const FROZEN_FIRE_SRC = 'referencias/fogo-congelado-sequencia.png';
  const state = { protection: 0, weekXp: 0 };

  const getClient = () => {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (typeof supabaseClient !==