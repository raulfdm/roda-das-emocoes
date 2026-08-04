import type { Locale } from './wheel/wheel';

/**
 * The app's own words — buttons, headings, hints.
 *
 * Distinct from Labels, which are transcribed from the published wheels and never authored
 * (ADR-0004). These are ours, and they follow the Locale the Wheel is showing so a screen reader
 * announces the whole page in one language.
 *
 * A Label is never wrapped in quotation marks of any kind, in any Locale. This file used to hold
 * three conventions at once — `«»` for Portuguese and Spanish, `“”` for English, and nothing at all
 * for `descend`. The last of those already worked, so it won rather than a fourth being invented.
 */
export interface Words {
	/**
	 * Announced while the page is still deciding what to draw.
	 *
	 * Always read from the default Locale, because the whole point of the loader is that we do not
	 * yet know which Locale the reader wants — that answer is in `localStorage` and cannot be reached
	 * before mount. Portuguese is canonical (ADR-0003), so it is the honest thing to announce.
	 */
	loading: string;
	title: string;
	tagline: string;
	/** What a tap on the Wheel does where there is still something to open. */
	centreHint: string;
	/**
	 * What a tap does where there is not — a desktop drawing all three rings.
	 *
	 * Nothing descends there, so `centreHint`'s promise of entering a feeling would describe an app
	 * this one has stopped being on that screen. What a tap does instead is light the Path down to the
	 * Node and take strength away from everything else, and the hint says so in those terms: the
	 * reader is being told they can point at the Wheel, not that they can go somewhere.
	 */
	pathHint: string;
	/**
	 * That the Wheel turns.
	 *
	 * Needed rather than merely nice: under the cropped framing four of the seven Cores are drawn
	 * outside the frame, and turning is how they are reached. Shown only until the Wheel has been
	 * turned once, so it retires itself the moment it has been understood (ADR-0009).
	 */
	turnHint: string;
	localeSwitcher: string;
	searchLabel: string;
	searchPlaceholder: string;
	searchEmpty: string;
	searchClear: string;
	/**
	 * The way back to the Cores, named after where it lands rather than after what it shows.
	 *
	 * It read `Ver a roda inteira` — *show the whole wheel* — which was true when it was written and
	 * stopped being so when the ring count was cut. A phone draws one ring outward from the Focus, so
	 * what this button actually returns you to is seven Cores out of 130 Nodes.
	 *
	 * A desktop draws all three again (ADR-0013), so the retired promise would be honest there — and the
	 * words stay as they are, because this button never appears on that screen. It is keyed on a Focus,
	 * and a Wheel where nothing descends never has one.
	 *
	 * So the words name the destination instead of promising a view. The Cores are where you start, and
	 * `início` says that without reaching for `principais` or `base`, which are the app's own words for
	 * *Primary* and *base* and are exactly what the Core entry in CONTEXT.md tells us to avoid. It also
	 * puts this button and `back` on the same verb: one step back, or all the way back.
	 */
	backToCores: string;
	/**
	 * The way up one level, written on a button rather than only into an accessible name.
	 *
	 * Short where `up` is full, because it shares a row with `backToCores` and the two spelled out at
	 * length wrap onto a second line on a phone — which costs the page height it does not have.
	 * `up` stays the accessible name of this button as well as of the centre, so a screen reader still
	 * hears the whole phrase and the visible word is contained in it.
	 */
	back: string;
	up: string;
	listHeading: string;
	listHint: string;
	inFocus: string;
	descend: (label: string) => string;
	/**
	 * What a tap on a Node with nothing left to open does: it is brought up to be read.
	 *
	 * Deliberately not `choose`, `select` or `pick`: nothing is chosen and nothing is kept. See
	 * ADR-0009, which reopened the tap without reopening Selection, and ADR-0013, which widened it
	 * past the Tertiaries without doing so either.
	 */
	read: (label: string) => string;
	/**
	 * Putting a lit Path out, which is what the centre offers where there is no Focus to leave.
	 *
	 * Takes the Path rather than the Label because it names what is on screen, and what is on screen
	 * is a whole branch at full strength with the rest of the Wheel dimmed behind it. Not `close` or
	 * `dismiss`: nothing was opened.
	 */
	clear: (path: string) => string;
	credit: string;
	creditLink: string;
}

export const WORDS: Record<Locale, Words> = {
	pt: {
		loading: 'A carregar…',
		title: 'Roda das Emoções',
		tagline: 'Do "sinto-me mal" à palavra exata, em três toques.',
		centreHint: 'Toque numa emoção para entrar nela.',
		pathHint: 'Toque numa emoção para destacar o seu caminho.',
		turnHint: 'Arraste a roda para girá-la.',
		localeSwitcher: 'Idioma',
		searchLabel: 'Procurar um sentimento',
		searchPlaceholder: 'ex.: sobrecarga',
		searchEmpty: 'Nenhum sentimento encontrado.',
		searchClear: 'Limpar',
		backToCores: 'Voltar ao início',
		back: 'Voltar',
		up: 'Voltar um nível',
		listHeading: 'Todos os sentimentos',
		listHint: 'A mesma roda em forma de lista, para navegar sem apontar.',
		inFocus: 'em foco',
		descend: (label) => `Abrir ${label}`,
		read: (label) => `Ver ${label}`,
		clear: (path) => `Limpar ${path}`,
		credit: 'Roda criada por Geoffrey Roberts —',
		creditLink: 'feelingswheel.app'
	},
	en: {
		loading: 'Loading…',
		title: 'Wheel of Emotions',
		tagline: 'From "I feel bad" to the exact word, in three taps.',
		centreHint: 'Tap a feeling to open it.',
		pathHint: 'Tap a feeling to light up its path.',
		turnHint: 'Drag the wheel to turn it.',
		localeSwitcher: 'Language',
		searchLabel: 'Search for a feeling',
		searchPlaceholder: 'e.g. overwhelmed',
		searchEmpty: 'No feelings found.',
		searchClear: 'Clear',
		backToCores: 'Back to the start',
		back: 'Back',
		// `Back one level` rather than `Go up one level`, so the button's visible word is contained in
		// its accessible name. Portuguese is canonical (ADR-0003) and already reads this way.
		up: 'Back one level',
		listHeading: 'Every feeling',
		listHint: 'The same wheel as a list, to navigate without pointing.',
		inFocus: 'in focus',
		descend: (label) => `Open ${label}`,
		read: (label) => `Show ${label}`,
		clear: (path) => `Clear ${path}`,
		credit: 'Wheel created by Geoffrey Roberts —',
		creditLink: 'feelingswheel.app'
	},
	es: {
		loading: 'Cargando…',
		title: 'Rueda de las Emociones',
		// Quoting a phrase someone might say, not delimiting a Label — so this keeps its quotes, and
		// takes the straight ones PT and EN already use for the same sentence.
		tagline: 'De "me siento mal" a la palabra exacta, en tres toques.',
		centreHint: 'Toca una emoción para abrirla.',
		pathHint: 'Toca una emoción para destacar su camino.',
		turnHint: 'Arrastra la rueda para girarla.',
		localeSwitcher: 'Idioma',
		searchLabel: 'Buscar un sentimiento',
		searchPlaceholder: 'ej.: abrumado',
		searchEmpty: 'No se encontraron sentimientos.',
		searchClear: 'Borrar',
		backToCores: 'Volver al inicio',
		back: 'Volver',
		up: 'Volver un nivel',
		listHeading: 'Todos los sentimientos',
		listHint: 'La misma rueda en forma de lista, para navegar sin apuntar.',
		inFocus: 'en foco',
		descend: (label) => `Abrir ${label}`,
		read: (label) => `Ver ${label}`,
		clear: (path) => `Borrar ${path}`,
		credit: 'Rueda creada por Geoffrey Roberts —',
		creditLink: 'feelingswheel.app'
	}
};
