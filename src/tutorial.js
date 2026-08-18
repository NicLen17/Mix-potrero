// Tutorial and Quick Start guide module for Mix-Potrero

export const EXAMPLE_PLAYERS_LIST = `domingo futbol 

1. paila
2. arguelles 
3. raul 
4. gome
5. gome
6. nanitaowo
7. harry
8. cucho
9. fede 
10. agu
11. mauro
12. jose
13. facu
14. joaquin
15. agu
16. chino
17. tomi
18. Álvaro`;

/**
 * Returns tutorial HTML content
 * @returns {string}
 */
export function getTutorialHtml() {
  return `
    <div class="tutorial-container">
      <div class="tutorial-hero">
        <span class="tutorial-badge">GUÍA RÁPIDA</span>
        <h1 class="tutorial-title">¿CÓMO USAR MIX-POTRERO?</h1>
        <p class="tutorial-subtitle">
          Armá tus partidos en 3 segundos, terminá con las discusiones de vestuario y compartí la victoria con estilo.
        </p>
      </div>

      <div class="tutorial-steps-grid">
        <!-- Paso 1 -->
        <div class="tutorial-step-card">
          <div class="step-number">1</div>
          <div class="step-icon">📋</div>
          <h2 class="step-title">Pegá la lista como venga</h2>
          <p class="step-desc">
            Copia el mensaje de tu grupo de WhatsApp o notas. No importa si tiene números (<code>1.</code>), guiones (<code>-</code>), emojis (⚽), o encabezados como <em>"domingo futbol"</em>.
          </p>
          <div class="step-tip">
            💡 <strong>Nombres repetidos:</strong> Si hay dos "Agu" o "Gome", la app les agrega automáticamente <code>(1)</code> y <code>(2)</code> para que no haya confusiones.
          </div>
        </div>

        <!-- Paso 2 -->
        <div class="tutorial-step-card">
          <div class="step-number">2</div>
          <div class="step-icon">⚖️</div>
          <h2 class="step-title">Elegí equipos y Modo Crack</h2>
          <p class="step-desc">
            Seleccioná entre <strong>2, 3 o 4 equipos</strong>. Si activás el <strong>Modo Crack ⭐</strong>, podés calificar a los jugadores del 1 al 5 y el algoritmo armará equipos ultra balanceados automáticamente.
          </p>
          <div class="step-tip">
            💾 <strong>Memoria automática:</strong> Las calificaciones se guardan en tu celular para los próximos partidos.
          </div>
        </div>

        <!-- Paso 3 -->
        <div class="tutorial-step-card">
          <div class="step-number">3</div>
          <div class="step-icon">⚽</div>
          <h2 class="step-title">¡A la cancha con nombres de jerga!</h2>
          <p class="step-desc">
            Tocá <strong>"ARMAR EQUIPOS"</strong> y recibí nombres de potrero argentino (<em>"Los Picantes"</em>, <em>"Sacachispas del Conurbano"</em>, <em>"Deportivo Birra"</em>). ¿No gustó? Tocá <strong>"Volver a mezclar"</strong>.
          </p>
        </div>

        <!-- Paso 4 -->
        <div class="tutorial-step-card">
          <div class="step-number">4</div>
          <div class="step-icon">📸</div>
          <h2 class="step-title">Cargá el resultado y picanteá</h2>
          <p class="step-desc">
            Al terminar el partido, poné el marcador final y tocá <strong>"COMPARTIR RESUMEN"</strong>. Se genera una imagen con el marcador, las formaciones y una frase de vestuario para mandar directo a WhatsApp.
          </p>
        </div>
      </div>

      <!-- Quick Test Action -->
      <div class="tutorial-action-box">
        <h3>¿Querés probar cómo funciona ahora mismo?</h3>
        <p>Cargá la lista de prueba de 18 jugadores con un solo toque.</p>
        <button id="btn-load-example" class="btn-primary btn-gold">
          🚀 CARGAR LISTA DE EJEMPLO
        </button>
      </div>

      <div class="tutorial-footer-nav">
        <a href="#/" class="btn-secondary">
          ⬅ VOLVER AL ARMADOR DE EQUIPOS
        </a>
      </div>
    </div>
  `;
}
