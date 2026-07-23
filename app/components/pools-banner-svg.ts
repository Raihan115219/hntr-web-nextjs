/** Inline SVG for pools hero — matches HNTR.art Desktop.html */
export const POOLS_BANNER_SVG = `<svg class="bn-art" viewBox="0 0 1110 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="bnSteel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--bn-steel1)"/>
      <stop offset=".55" stop-color="var(--bn-steel2)"/>
      <stop offset="1" stop-color="var(--bn-steel1)"/>
    </linearGradient>
    <pattern id="bnGrid" width="46" height="46" patternUnits="userSpaceOnUse">
      <path d="M46 0H0V46" fill="none" stroke="var(--bn-grid)" stroke-width="1" stroke-dasharray="3 5"/>
    </pattern>
    <pattern id="bnDots" width="9" height="9" patternUnits="userSpaceOnUse">
      <rect x="2" y="2" width="3.2" height="3.2" fill="var(--bn-ln2)"/>
    </pattern>
    <pattern id="bnHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="7" height="7" fill="var(--bn-bg1)"/>
      <line x1="2" y1="0" x2="2" y2="7" stroke="var(--bn-ln)" stroke-width="2.2" opacity=".8"/>
      <line x1="5.5" y1="0" x2="5.5" y2="7" stroke="var(--bn-ln)" stroke-width=".8" opacity=".45"/>
    </pattern>
    <filter id="bnWobble" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/>
    </filter>
    <marker id="bnArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="var(--bn-ln)"/>
    </marker>
    <marker id="bnArrD" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="var(--bn-ln2)"/>
    </marker>
  </defs>
  <g class="bn-wobble">
    <rect width="1110" height="400" fill="url(#bnGrid)" opacity=".7"/>
    <g class="bn-net">
      <polygon points="560,270 700,150 720,300" fill="var(--bn-ln2)" opacity=".08"/>
      <g class="net-lines">
        <line class="net-line" x1="35" y1="295" x2="125" y2="215"/>
        <line class="net-line" x1="125" y1="215" x2="95" y2="115"/>
        <line class="net-line" x1="125" y1="215" x2="215" y2="155"/>
        <line class="net-line" x1="215" y1="155" x2="305" y2="235"/>
        <line class="net-line" x1="125" y1="215" x2="195" y2="300"/>
        <line class="net-line" x1="195" y1="300" x2="305" y2="235"/>
        <line class="net-line" x1="305" y1="235" x2="335" y2="115"/>
        <line class="net-line" x1="215" y1="155" x2="335" y2="115"/>
        <line class="net-line" x1="305" y1="235" x2="425" y2="205"/>
        <line class="net-line" x1="335" y1="115" x2="480" y2="135"/>
        <line class="net-line" x1="425" y1="205" x2="480" y2="135"/>
        <line class="net-line" x1="425" y1="205" x2="470" y2="285"/>
        <line class="net-line" x1="195" y1="300" x2="265" y2="385"/>
        <line class="net-line" x1="305" y1="235" x2="390" y2="330"/>
        <line class="net-line" x1="390" y1="330" x2="470" y2="285"/>
        <line class="net-line" x1="35" y1="295" x2="65" y2="385"/>
        <line class="net-line" x1="95" y1="115" x2="150" y2="30"/>
        <line class="net-line" x1="150" y1="30" x2="280" y2="40"/>
        <line class="net-line" x1="280" y1="40" x2="335" y2="115"/>
      </g>
      <line class="bn-flow" x1="125" y1="215" x2="215" y2="155"/>
      <line class="bn-flow" x1="305" y1="235" x2="425" y2="205" style="animation-delay:-1.1s"/>
      <line class="bn-flow" x1="195" y1="300" x2="305" y2="235" style="animation-delay:-.6s"/>
      <circle class="net-halo" cx="125" cy="215" r="14"/>
      <circle class="net-halo" cx="195" cy="300" r="16" style="animation-delay:-1.4s"/>
      <circle class="net-halo" cx="425" cy="205" r="13" style="animation-delay:-2.2s"/>
      <circle class="net-node" cx="35" cy="295" r="5"/>
      <circle class="net-node" cx="125" cy="215" r="7" style="animation-delay:-.4s"/>
      <circle class="net-node" cx="95" cy="115" r="5" style="animation-delay:-.9s"/>
      <circle class="net-node" cx="215" cy="155" r="6" style="animation-delay:-1.3s"/>
      <circle class="net-node" cx="195" cy="300" r="8" style="animation-delay:-1.7s"/>
      <circle class="net-node" cx="305" cy="235" r="6" style="animation-delay:-2.1s"/>
      <circle class="net-node" cx="335" cy="115" r="5" style="animation-delay:-2.5s"/>
      <circle class="net-node" cx="425" cy="205" r="6" style="animation-delay:-2.9s"/>
      <circle class="net-node" cx="390" cy="330" r="5" style="animation-delay:-.2s"/>
      <circle class="net-node" cx="65" cy="385" r="5" style="animation-delay:-.7s"/>
      <circle class="net-node" cx="265" cy="385" r="6" style="animation-delay:-1.1s"/>
      <circle class="net-node" cx="480" cy="135" r="4" style="animation-delay:-1.6s"/>
      <circle class="net-node" cx="470" cy="285" r="5" style="animation-delay:-2s"/>
      <circle class="net-node" cx="150" cy="30" r="4" style="animation-delay:-2.4s"/>
      <circle class="net-node" cx="280" cy="40" r="5" style="animation-delay:-2.8s"/>
    </g>
    <g class="bn-center">
      <rect x="575" y="205" width="130" height="85" fill="url(#bnDots)" opacity=".85"/>
      <path d="M430 345v-10M439 345v-18M448 345v-10M457 345v-24M466 345v-10M475 345v-18M484 345v-32M493 345v-10M502 345v-18M511 345v-10M520 345v-24M529 345v-10M538 345v-18M547 345v-32M556 345v-10M565 345v-18M574 345v-10M583 345v-24M592 345v-10M601 345v-18M610 345v-32M619 345v-10M628 345v-18M637 345v-10M646 345v-24M655 345v-10M430 345H660" stroke="var(--bn-ln)" stroke-width="1.6" fill="none" opacity=".8"/>
      <polygon points="794,70 777,99.4 743,99.4 726,70 743,40.6 777,40.6" stroke="var(--bn-ln2)" stroke-width="1.5" fill="none" opacity=".6"/>
      <polygon points="852,45 841,64 819,64 808,45 819,26 841,26" stroke="var(--bn-ln2)" stroke-width="1.2" fill="none" opacity=".45"/>
      <polygon points="716,110 708,124 692,124 684,110 692,96 708,96" fill="var(--bn-ln2)" opacity=".15"/>
      <g stroke="var(--bn-ln)" stroke-width="2.4" fill="none" opacity=".85">
        <path d="M700 152l-10 8 10 8"/><path d="M686 152l-10 8 10 8"/><path d="M672 152l-10 8 10 8"/>
      </g>
      <g stroke="var(--bn-ln)" stroke-width="2" fill="none" opacity=".6">
        <path d="M610 362l-8 6 8 6"/><path d="M598 362l-8 6 8 6"/><path d="M586 362l-8 6 8 6"/>
      </g>
      <line x1="570" y1="262" x2="706" y2="140" stroke="var(--bn-ln)" stroke-width="1.5" marker-end="url(#bnArr)"/>
      <line x1="866" y1="28" x2="706" y2="38" stroke="var(--bn-ln)" stroke-width="1.5" marker-end="url(#bnArr)"/>
      <line x1="636" y1="302" x2="756" y2="330" stroke="var(--bn-ln2)" stroke-width="1.2" marker-end="url(#bnArrD)" opacity=".7"/>
    </g>
    <g class="bn-gears">
      <g transform="translate(735,190)"><g class="gear-rot" data-speed="8">
        <circle class="g-ghost" r="40" stroke-width="12" stroke-dasharray="2 8"/>
        <circle class="g-ghost" r="26" stroke-width="2"/>
      </g></g>
      <g transform="translate(935,235)"><g class="gear-rot" data-speed="12">
        <circle class="g-teeth" r="95" stroke-width="30" stroke-dasharray="24.87 24.87"/>
        <circle class="g-rim" r="72" stroke-width="7"/>
        <rect class="g-spoke" x="-66" y="-7" width="132" height="14" rx="7"/>
        <rect class="g-spoke" x="-66" y="-7" width="132" height="14" rx="7" transform="rotate(60)"/>
        <rect class="g-spoke" x="-66" y="-7" width="132" height="14" rx="7" transform="rotate(120)"/>
        <circle class="g-hub" r="30"/>
        <circle class="g-rim" r="30" stroke-width="4"/>
        <circle class="g-hole" r="11"/>
      </g></g>
      <g transform="translate(795,95)"><g class="gear-rot" data-speed="-20">
        <circle class="g-teeth" r="58" stroke-width="18" stroke-dasharray="18.22 18.22"/>
        <circle class="g-rim" r="44" stroke-width="5"/>
        <circle class="g-rim" r="30" stroke-width="9" stroke-dasharray="8 6"/>
        <circle class="g-hub" r="14"/>
        <circle class="g-hole" r="5"/>
      </g></g>
      <g transform="translate(1048,88)"><g class="gear-rot" data-speed="-23">
        <circle class="g-teeth" r="50" stroke-width="16" stroke-dasharray="17.45 17.45"/>
        <circle class="g-rim" r="38" stroke-width="5"/>
        <rect class="g-spoke" x="-34" y="-5" width="68" height="10" rx="5"/>
        <rect class="g-spoke" x="-34" y="-5" width="68" height="10" rx="5" transform="rotate(90)"/>
        <circle class="g-hub" r="15"/>
        <circle class="g-hole" r="6"/>
      </g></g>
      <g transform="translate(800,332)"><g class="gear-rot" data-speed="-18">
        <circle class="g-teeth" r="62" stroke-width="20" stroke-dasharray="19.48 19.48"/>
        <circle class="g-rim" r="47" stroke-width="6"/>
        <rect class="g-spoke" x="-42" y="-6" width="84" height="12" rx="6"/>
        <rect class="g-spoke" x="-42" y="-6" width="84" height="12" rx="6" transform="rotate(45)"/>
        <rect class="g-spoke" x="-42" y="-6" width="84" height="12" rx="6" transform="rotate(90)"/>
        <rect class="g-spoke" x="-42" y="-6" width="84" height="12" rx="6" transform="rotate(135)"/>
        <circle class="g-hub" r="20"/>
        <circle class="g-hole" r="8"/>
      </g></g>
      <g transform="translate(893,378)"><g class="gear-rot" data-speed="38">
        <circle class="g-teeth" r="30" stroke-width="12" stroke-dasharray="11.78 11.78"/>
        <circle class="g-rim" r="21" stroke-width="4"/>
        <circle class="g-hub" r="9"/>
        <circle class="g-hole" r="3.5"/>
      </g></g>
      <g transform="translate(1082,285)"><g class="gear-rot" data-speed="-30">
        <circle class="g-teeth" r="38" stroke-width="14" stroke-dasharray="14.92 14.92"/>
        <circle class="g-rim" r="27" stroke-width="5"/>
        <circle class="g-hub" r="11"/>
        <circle class="g-hole" r="4"/>
      </g></g>
      <g transform="translate(1010,352)"><g class="gear-rot" data-speed="57">
        <circle class="g-teeth" r="20" stroke-width="9" stroke-dasharray="8.98 8.98"/>
        <circle class="g-hub" r="8"/>
        <circle class="g-hole" r="3"/>
      </g></g>
      <g class="dim" stroke="var(--bn-ln2)" stroke-width="1" opacity=".85">
        <line x1="840" y1="372" x2="1030" y2="372" marker-start="url(#bnArrD)" marker-end="url(#bnArrD)"/>
        <path d="M840 364v16M1030 364v16"/>
        <line x1="722" y1="40" x2="722" y2="150" marker-start="url(#bnArrD)" marker-end="url(#bnArrD)"/>
        <path d="M714 40h16M714 150h16"/>
      </g>
      <g class="dim" fill="var(--bn-ln2)" font-family="var(--fm)" font-size="11" letter-spacing=".08em">
        <text x="912" y="364">Ø 190</text>
        <text x="700" y="98">R58</text>
      </g>
    </g>
  </g>
  <rect class="bn-gearzone" x="690" y="0" width="420" height="400" fill="transparent"/>
</svg>`;
