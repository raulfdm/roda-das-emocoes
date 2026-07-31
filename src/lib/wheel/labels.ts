/**
 * The Wheel, transcribed from the three published renderings in `docs/wheels/`.
 *
 * Every Label is adopted verbatim (ADR-0004). Nothing here is authored, normalised or de-gendered —
 * Portuguese mixes nouns and adjectives, Spanish reads masculine throughout, and both stay as
 * published. That is register, and register is the source's to choose.
 *
 * The order is the order the poster reads: clockwise from 12 o'clock, Cores then Secondaries then
 * Tertiaries. The geometry depends on it — reordering this file reorders the Wheel.
 *
 * ## Corrections to the source images
 *
 * Four Labels are printed wrong on the wheels themselves and are corrected here. These are
 * misprints, not editorial choices — see the Correction section of ADR-0004, which draws the line.
 * Each is listed so nobody "restores" it against the image later:
 *
 * - `Mal › Ocupado › Apressado` (pt) — the image prints *Agradecimento* ("thankfulness") in the slot
 *   English fills with *Rushed* and Spanish with *Apurado*. A pasting slip, and the only one of the
 *   four that sends a reader to the wrong feeling rather than merely reading as a typo.
 * - `Raiva › Amargura › Indignado` (pt) — the image prints `Indgnado`, missing the `i`.
 * - `Raiva › Desapontado › Ressentido` (pt) — the image prints `Resentido` with a single `s`. The
 *   Spanish Label on the same Node *is* `Resentido`, which is correct Spanish and untouched.
 * - `Feliz` (es) — the image prints `Felíz`, with an accent Spanish does not put there.
 */

import type { Locale } from './wheel';

/** One Node as it was read off the images: its three Labels, then its children. */
export type Transcribed = readonly [
	pt: string,
	en: string,
	es: string,
	children?: readonly Transcribed[]
];

/** The Locale each slot of a {@link Transcribed} Node carries, in order. */
export const LABEL_ORDER: readonly Locale[] = ['pt', 'en', 'es'];

/**
 * Colour is data, not design tokens (see the spec's Rendering section). Each Core owns a hue taken
 * from the published wheels; Secondaries and Tertiaries are tints of it derived outward. Indexed to
 * match {@link WHEEL}.
 */
export const CORE_TINTS: readonly { hue: number; saturation: number }[] = [
	{ hue: 41, saturation: 88 }, // Medo — amber
	{ hue: 2, saturation: 84 }, // Raiva — red
	{ hue: 210, saturation: 8 }, // Enojado — grey
	{ hue: 208, saturation: 66 }, // Triste — blue
	{ hue: 53, saturation: 92 }, // Feliz — yellow
	{ hue: 275, saturation: 48 }, // Surpresa — purple
	{ hue: 152, saturation: 46 } // Mal — green
];

export const WHEEL: readonly Transcribed[] = [
	['Medo', 'Fearful', 'Miedoso', [
		['Assustado', 'Scared', 'Asustado', [
			['Indefeso', 'Helpless', 'Impotente'],
			['Aterrorizado', 'Frightened', 'Temeroso']
		]],
		['Ansiedade', 'Anxious', 'Ansioso', [
			['Sobrecarregado', 'Overwhelmed', 'Abrumado'],
			['Preocupação', 'Worried', 'Preocupado']
		]],
		['Insegurança', 'Insecure', 'Inseguro', [
			['Inadequado', 'Inadequate', 'Inadecuado'],
			['Inferior', 'Inferior', 'Inferior']
		]],
		['Fraco', 'Weak', 'Débil', [
			['Incapaz', 'Worthless', 'Sin valor'],
			['Insignificante', 'Insignificant', 'Insignificante']
		]],
		['Rejeição', 'Rejected', 'Rechazado', [
			['Excluído', 'Excluded', 'Excluido'],
			['Reprimido', 'Persecuted', 'Perseguido']
		]],
		['Ameaçado', 'Threatened', 'Amenazado', [
			['Nervoso', 'Nervous', 'Nervioso'],
			['Exposto', 'Exposed', 'Expuesto']
		]]
	]],

	['Raiva', 'Angry', 'Enojado', [
		['Desapontado', 'Let down', 'Desilusionado', [
			['Traído', 'Betrayed', 'Traicionado'],
			['Ressentido', 'Resentful', 'Resentido']
		]],
		['Humilhação', 'Humiliated', 'Humillado', [
			['Desrespeitado', 'Disrespected', 'Irrespetado'],
			['Ridicularizado', 'Ridiculed', 'Ridiculizado']
		]],
		['Amargura', 'Bitter', 'Amargado', [
			['Indignado', 'Indignant', 'Indignado'],
			['Violado', 'Violated', 'Violado']
		]],
		['Ensandecido', 'Mad', 'Molesto', [
			['Fúria', 'Furious', 'Furioso'],
			['Inveja', 'Jealous', 'Celoso']
		]],
		['Agressivo', 'Aggressive', 'Agresivo', [
			['Provocador', 'Provoked', 'Provocado'],
			['Hostil', 'Hostile', 'Hostil']
		]],
		['Frustração', 'Frustrated', 'Frustrado', [
			['Enfurecido', 'Infuriated', 'Enfurecido'],
			['Aborrecido', 'Annoyed', 'Irritado']
		]],
		['Reservado', 'Distant', 'Distante', [
			['Retraído', 'Withdrawn', 'Aislado'],
			['Entorpecido', 'Numb', 'Entumecido']
		]],
		['Crítico', 'Critical', 'Extremo', [
			['Cético', 'Sceptical', 'Escéptico'],
			['Arrogante', 'Dismissive', 'Desdeñoso']
		]]
	]],

	['Enojado', 'Disgusted', 'Asqueado', [
		['Desaprovação', 'Disapproving', 'Desaprobador', [
			['Julgamento', 'Judgmental', 'Crítico'],
			['Constrangido', 'Embarrassed', 'Avergonzado']
		]],
		['Desapontado', 'Disappointed', 'Decepcionado', [
			['Chocado', 'Appalled', 'Apaleado'],
			['Revoltado', 'Revolted', 'Revuelto']
		]],
		['Terrível', 'Awful', 'Terrible', [
			['Nauseado', 'Nauseated', 'Nauseabundo'],
			['Detestável', 'Detestable', 'Detestable']
		]],
		['Rejeição', 'Repelled', 'Repugnado', [
			['Horrorizado', 'Horrified', 'Horrorizado'],
			['Hesitação', 'Hesitant', 'Titubeante']
		]]
	]],

	['Triste', 'Sad', 'Triste', [
		['Magoado', 'Hurt', 'Herido', [
			['Constrangido', 'Embarrassed', 'Desconcertado'],
			['Desapontado', 'Disappointed', 'Decepcionado']
		]],
		['Depressivo', 'Depressed', 'Deprimido', [
			['Inferior', 'Inferior', 'Inferior'],
			['Vazio', 'Empty', 'Vacío']
		]],
		['Culpa', 'Guilty', 'Culpable', [
			['Remorso', 'Remorseful', 'Arrepentido'],
			['Vergonha', 'Ashamed', 'Avergonzado']
		]],
		['Desespero', 'Despair', 'Desesperanzado', [
			['Impotente', 'Powerless', 'Impotente'],
			['Sofrimento', 'Grief', 'Adolorido']
		]],
		['Vulnerável', 'Vulnerable', 'Vulnerable', [
			['Frágil', 'Fragile', 'Frágil'],
			['Vitimado', 'Victimised', 'Victimizado']
		]],
		['Solidão', 'Lonely', 'Solo', [
			['Abandonado', 'Abandoned', 'Abandonado'],
			['Isolado', 'Isolated', 'Aislado']
		]]
	]],

	['Feliz', 'Happy', 'Feliz', [
		['Otimismo', 'Optimistic', 'Optimista', [
			['Inspiração', 'Inspired', 'Inspirado'],
			['Esperança', 'Hopeful', 'Esperanzado']
		]],
		['Confiança', 'Trusting', 'Confiado', [
			['Intimidade', 'Intimate', 'Profundo'],
			['Sensibilidade', 'Sensitive', 'Sensible']
		]],
		['Paz', 'Peaceful', 'Pacífico', [
			['Agradecimento', 'Thankful', 'Agradecido'],
			['Amoroso', 'Loving', 'Amoroso']
		]],
		['Poder', 'Powerful', 'Poderoso', [
			['Criatividade', 'Creative', 'Creativo'],
			['Coragem', 'Courageous', 'Valiente']
		]],
		['Aceitação', 'Accepted', 'Aceptado', [
			['Reconhecimento', 'Valued', 'Valorado'],
			['Respeito', 'Respected', 'Respetado']
		]],
		['Orgulho', 'Proud', 'Orgulloso', [
			['Confiança', 'Confident', 'Seguro'],
			['Satisfação', 'Successful', 'Exitoso']
		]],
		['Interesse', 'Interested', 'Interesado', [
			['Indagação', 'Inquisitive', 'Intrigado'],
			['Curiosidade', 'Curious', 'Curioso']
		]],
		['Satisfação', 'Content', 'Contento', [
			['Felicidade', 'Joyful', 'Jubiloso'],
			['Liberdade', 'Free', 'Liberado']
		]],
		['Diversão', 'Playful', 'Alegre', [
			['Atrevimento', 'Cheeky', 'Descarado'],
			['Excitação', 'Aroused', 'Entusiasmado']
		]]
	]],

	['Surpresa', 'Surprised', 'Sorprendido', [
		['Excitação', 'Excited', 'Emocionado', [
			['Energético', 'Energetic', 'Enérgico'],
			['Ansiedade', 'Eager', 'Anhelante']
		]],
		['Espanto', 'Amazed', 'Atónito', [
			['Temor', 'Awe', 'Impresionado'],
			['Atônito', 'Astonished', 'Estupefacto']
		]],
		['Confusão', 'Confused', 'Confundido', [
			['Perplexidade', 'Perplexed', 'Perplejo'],
			['Desilusão', 'Disillusioned', 'Desengañado']
		]],
		['Assombro', 'Startled', 'Sobresaltado', [
			['Desânimo', 'Dismayed', 'Consternado'],
			['Choque', 'Shocked', 'Asombrado']
		]]
	]],

	['Mal', 'Bad', 'Mal', [
		['Cansaço', 'Tired', 'Cansado', [
			['Disperso', 'Unfocussed', 'Desenfocado'],
			['Sonolento', 'Sleepy', 'Somnoliento']
		]],
		['Estresse', 'Stressed', 'Estresado', [
			['Sem controle', 'Out of control', 'Fuera de control'],
			['Sobrecarregado', 'Overwhelmed', 'Abrumado']
		]],
		['Ocupado', 'Busy', 'Ocupado', [
			['Apressado', 'Rushed', 'Apurado'],
			['Pressionado', 'Pressured', 'Presionado']
		]],
		['Tédio', 'Bored', 'Aburrido', [
			['Apatia', 'Apathetic', 'Apático'],
			['Indiferença', 'Indifferent', 'Indiferente']
		]]
	]]
];
