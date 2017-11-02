// -------------------------------------------------------------------
// markItUp!
// -------------------------------------------------------------------
// Copyright (C) 2008 Jay Salvat
// http://markitup.jaysalvat.com/
// -------------------------------------------------------------------
// MarkDown tags example
// http://en.wikipedia.org/wiki/Markdown
// http://daringfireball.net/projects/markdown/
// -------------------------------------------------------------------
// Feel free to add more tags
// -------------------------------------------------------------------
var markitupSettings = {
	previewParserPath: '',
	onShiftEnter: {keepDefault: false, openWith: '\n\n'},
	markupSet: [
		{name: '1', key: '1', openWith: '# ', placeHolder: 'Votre titre ici...'},
		{name: '2', key: '2', openWith: '## ', placeHolder: 'Votre titre ici...'},
		{name: '3', key: '3', openWith: '### ', placeHolder: 'Votre titre ici...'},
		{name: '4', key: '4', openWith: '#### ', placeHolder: 'Votre titre ici...'},
		{name: '5', key: '5', openWith: '##### ', placeHolder: 'Votre titre ici...'},
		{name: '6', key: '6', openWith: '###### ', placeHolder: 'Votre titre ici...'},
		{separator: '|'},
		{name: '', key: 'B', openWith: '**', closeWith: '**'},
		{name: '', key: 'I', openWith: '_', closeWith: '_'},
		{separator: '|'},
		{name: '', key: 'K', openWith: '- '},
		{
			name: '', key: 'J', openWith: function (markItUp) {
			return markItUp.line + '. ';
		}
		},
		{separator: '|'},
		{name: '', key: 'P', replaceWith: '![[![Texte alternatif]!]]([![Url:!:http://]!] "[![Titre]!]")'},
		{
			name: '',
			key: 'L',
			openWith: '[',
			closeWith: ']([![Url:!:http://]!])',
			placeHolder: 'Le texte du lien...'
		},
		{separator: '|'},
		{name: '', key: 'Q', openWith: '> '},
		{separator: '|'},
		{name: '', key: 'G', call: 'preview', className: "preview"}
	]
};
