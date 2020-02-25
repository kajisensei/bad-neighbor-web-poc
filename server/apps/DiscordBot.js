/**
 * Created by Cossement Sylvain on 25-04-17.
 */

const discord = require('discord.js');
const winston = require('winston');
const keystone = require('keystone');
const User = keystone.list('User');
const dateFormat = require('dateformat');

const APP_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_NAME = process.env.DISCORD_CHANNEL || "general";
const CHANNEL_WRITE = process.env.DISCORD_CHANNEL_WRITE || "annonces-site";
const CHANNEL_ANOUNCEMENT = process.env.DISCORD_CHANNEL_ANOUNCEMENT || process.env.DISCORD_CHANNEL || "annonces-officielles";

/**
 * Initialisation
 */

let client;
const logs = [];

const RULES = {
	"1": {
		"title": "Volume 1 : l'esprit BN",
		"1": {
			"title": "Appartenir à un clan",
			"content": `Nous sommes un clan, ce qui signifie que nous appartenons tous à un groupe et que nous suivons un idéal ou un objectif commun. Nous sommes un clan pvp, ce qui signifie également que la principale raison pour laquelle nous sommes réunis sous le même bannière est le pvp. De plus, notre clan possède une histoire et une ligne de conduite définie par une présentation et une charte qui donne une identité à notre clan.`
		},
		"2": {
			"title": "Un sale caractère",
			"content": `Nous sommes belliqueux, impitoyables et revanchards. Aucun affrontement ne nous fait peur même si nous préférons attendre d'être en nombre et au niveau adéquat pour attaquer plus fort que nous. Mais nous ne baissons jamais les yeux et ne lâchons jamais ne serait-ce qu'un bout de terrain à notre adversaire. Quiconque s'en prend au clan Bad Neighbor doit apprendre qu'il ne doit jamais recommencer. Nous nous entraînons régulièrement, nous jouons à fond et nous punissons fort.
Nous n'avons pas peur de jouer dur pour pousser l'adversaire à l'abandon.`
		},
		"3": {
			"title": "J'appelle mes cousins",
			"content": `Nous sommes un clan et nous ne laissons aucun de nos membre subir un affront quel qu'il soit sans représailles. J'appelle mes potes BN pour rendre la monnaie de la pièce et mes potes BN lâchent tout pour répondre à mon appel.`
		},
		"4": {
			"title": "T'inquiètes, y en a largement pour deux",
			"content": `L'effort de guerre dans un jeu est primordial. Quand on donne, on reçoit en retour de manière directe ou indirecte. S'investir, aider les autres, aider au financement d'un item, farmer pour le clan, etc… Chacun doit donner de son propre chef et ne pas calculer s'il a donné plus ou moins qu'un autre. Personne n'a le même temps de jeu mais nous avons tous le même objectif.`
		},
		"5": {
			"title": "Fermes ta gueule t'auras chaud au dents",
			"content": `Même si le pvp forum est une de mes grandes passions, il est déconseillé de s'adonner à des pratiques indignes comme le troll et les provocations quelles qu'elles soient. Se moquer de son adversaire décrédibilise la victoire et le combat en lui-même. Cela nuit à la réputation du clan et à son impact psychologique lors des affrontements.
Quand vous tuez quelqu'un, taisez-vous, ne répondez pas, ne fanfaronne pas.`
		},
		"6": {
			"title": "Bavardages et commérages",
			"content": `La présence sur les réseaux de communication n'est pas encouragée. Même si chacun est libre de squatter les Discord de tout et n'importe qui, l'absence des BN ou la présence sélective conforte notre côté mystérieux. Si on ne connaît pas les BN, on ne saura pas qui on a en face donc nous ne laisserons aucune prise à notre adversaire que ça soit psychologique ou tactique.`
		},
		"7": {
			"title": "Le contrat de confiance",
			"content": `Il faut impérativement faire confiance à tous les "dirigeants" du clan. Nous passons du temps à réfléchir et discuter entre officiers, leaders, et GM pour être certain d'avoir pensé à tout et parer à toutes les éventualités. Nous faisons de notre mieux pour être les plus justes, pour prendre les meilleures décisions pour que tout le monde s'amuse.
Si toutefois une décision n'est pas comprise ou mal vécue, vous pouvez nous contacter en privé et nous serons toujours ouverts à la discussion.`
		},
	},
	"2": {
		"title": "Volume 2 : l'esprit pvp BN",
		"1": {
			"title": "Un BN croise un mec",
			"content": `Chacun est libre d'engager ou pas. Cela dit, le Matos ne sera pas remboursé donc à chacun de voir si ça vaut le coup.
Si le BN se fait engager et que l'issue du combat ne lui est pas favorable (fuite ou mort), les représailles sont obligatoires. Il convient de donner le nom du mec et aussitôt une patrouille se mobilise pour venir présenter notre clan comme il se doit.
On touche pas à un BN !`
		},
		"2": {
			"title": "Un BN croise un BH",
			"content": `Les chasseurs de primes (ou BH) sont nos pires ennemis. Ce sont eux qui vont nous faire chier et nous faire passer pour des merdes si jamais ils nous butent nos gars trop facilement.
Ainsi, les **BH sont tués à vue** !

Si un BN s'est fait attaquer par un BH, ce dernier sera traqué et abattu comme un chien. Que ça soit dans son vaisseau ou dans un bar.

Il servira d'exemple.

Si un BN s'est fait péter par un BH, ce dernier sera traqué et abattu comme un chien (à plusieurs reprises s'il le faut) jusqu'à mort définitive du personnage et/ou remboursement de la prime.
Dans un second temps, si le BH revient une seconde fois, il sera traqué jusqu'à plus soif.

Il servira d'exemple.`
		},
		"3": {
			"title": "Un BN croise un advocacy ou un connard de l'UEE",
			"content": `On essaie d'éviter. Moins on aura affaire à eux, plus on sera tranquille.`
		},
		"4": {
			"title": "Après la neutralisation d'un vaisseau capital",
			"content": `Suivant la nature et le degré du conflit ou de la mission, il vous aura été communiqué au préalable ou en temps réel s'il faut juste laisser le vaisseau dériver dans l'espace, l'exposer ou même brûler les capsules de sauvetage et/ou la cargaison et faire un carnage.`
		},
		"5": {
			"title": "Lors d'un abordage",
			"content": `Si l'équipage attaqué se comporte avec respect, tout le monde repart vivant.
Si l'equipage à tiré, sur nos vaisseaux en début de fight mais que nous n'avons aucune perte, entre 0 et 1 canonnier sera tué d'une balle dans la tête.
Si l'equipage à tiré à partir du moment où le vaisseau est considéré comme neutralisé, les canonniers seront tués.
Si il y a fusillade à l'intérieur du vaisseau, tout le monde est tué à l'exception du pilote.
Si c'est un équipage d'enculés on bute tout le monde et on fait tout sauter.`
		},
		"6": {
			"title": "Un BN croise un ancien BN",
			"content": `Chapitre difficile à aborder mais c'est à ce moment précis qu'il faut se rappeler qu'on est dans un jeu vidéo.
Si l'ex-BN est parti dans les règles, aucune représailles n'est envisagé. Il est même possible qu'on reste en bons termes.
Si l'ex-BN est parti comme un voleur, aucune représailles mais qu'on n'en entende plus parler.
Si l'ex-BN est parti de manière peu correcte ou s'il est revenu nous faire chier ou à juste troll quelque part, il sera tué à vue.
Si l'ex-BN casse les couilles et se la raconte ou fait des menaces, il sera traqué puis abattu comme un traître au moment où ça le pénalisera le plus.
Si l'ex-BN n'a toujours pas compris, il sera dézingué jusqu'à mort définitive de son personnage.`
		},
		"7": {
			"title": "Si un BN trouve un espion",
			"content": `Il le signale automatiquement aux offs connectés qui informeront tous les leads par message sur Discord.
L'espion sera ensuite traqué à vie sur SC et son organisation sera rayée de la carte.`
		},
		"8": {
			"title": "Si BN est en guerre ouverte contre un autre clan",
			"content": `Le clan et ses membres doivent être rayés de la carte.
Le GM et les Offs de l'organisation ennemie feront l'objet d'un farming intensif.`
		},
		"9": {
			"title": "Un BN croise un mec d'un clan ennemi",
			"content": `Ce mec doit mourir !
Le BN appelle des renforts et reste sur le trace du mec en question. Une fois les renforts arrivés là patrouille et le pisteur lui niquent sa gueule.
Suivant le degré du conflit, il aura été communiqué au préalable s'il faut terminer le mec ou juste lui exploser son vaisseau.`
		},
	}
};

const createClient = () => {
	if (!client) {
		winston.info(`Bot Discord: Creating client.`);

		client = new discord.Client();
		client.on('ready', () => {
			winston.info('Bot Discord: I am ready!');
			if (logs.length > 20) {
				logs.shift()
			}
			logs.push(`Ready at ${dateFormat(new Date(), "mm/dd/yyyy HH:MM:ss")}`);
		});
		client.on('disconnect', () => {
			winston.warn('Bot Discord: Disconnected');
			if (logs.length > 20) {
				logs.shift()
			}
			logs.push(`Disconnect at ${dateFormat(new Date(), "mm/dd/yyyy HH:MM:ss")}`);
		});
		client.on('error', error => {
			winston.error('Bot Discord: error', error);
			if (logs.length > 20) {
				logs.shift()
			}
			logs.push(`Error at ${dateFormat(new Date(), "mm/dd/yyyy HH:MM:ss")}`);
		});
		client.on('message', msg => {
			if (msg.isMemberMentioned(client.user)) {
				const content = msg.content.toLowerCase();
				let reply = "";
				if (content.indexOf("règle") !== -1) {
					const allRules = content.substring(content.indexOf("règle") + "règle".length + 1);
					const ruleParts = allRules.split(".").map(e => e.trim().replace(/[^\d]+/g, ""));
					const volumeIndex = ruleParts[0];
					const ruleIndex = ruleParts[1];
					const subRuleIndex = ruleParts[2];
					if (RULES[volumeIndex]) {
						const volume = RULES[volumeIndex];
						const volumeTitle = volume.title;
						if (ruleIndex && volume[ruleIndex]) {
							const rule = volume[ruleIndex];
							const ruleTitle = rule.title;
							const ruleContent = rule.content;
							reply =
								`*[${volumeTitle}]*
**Règle ${volumeIndex}.${ruleIndex} - "${ruleTitle}"**
"${ruleContent}"`;
						} else {
							const rules = [];
							let i = 1;
							let istr = `${i}`;
							while (volume[istr]) {
								let rule = volume[istr];
								rules.push(`\nRègle ${volumeIndex}.${istr} - **"${rule.title}"**`);
								istr = `${++i}`;
							}
							reply = `*[${volumeTitle}]*${rules.join("")}`;
						}
					}
				}
				if (reply) {
					msg.reply(reply);
				}
			}
		});

		// log our bot in
		client.login(APP_TOKEN).catch(err => {
			winston.error(err);
		});
	} else {
		winston.warn(`Bot Discord: I can't create because already exists.`);
	}
};

const recreateClient = () => {
	if (client) {
		winston.info(`Bot Discord: Destroying...`);
		const old = client;
		client = null;
		old.destroy().then(() => {
			winston.info(`Bot Discord: Destroyed.`);
			createClient();
		});
	} else {
		createClient();
	}
};

recreateClient();


const sendPrivateMessage = (target, message, options) => {
	let user;
	client.users.forEach(u => {
		if (u.username + '#' + u.discriminator === target)
			user = u;
	});
	if (user) {
		return user.send(message, options);
	}
};

/**
 * API
 */
exports = module.exports = {

	getChannelBN: () => CHANNEL_WRITE,

	getLogs: () => logs,

	recreateClient: recreateClient,

	sendMessage: (message, options) => {
		let promise = null;
		client.channels.forEach(channel => {
			if (channel.name === CHANNEL_WRITE) {
				promise = channel.send(message, options);
			}
		});
		return promise || new Promise((resolve, reject) => resolve());
	},

	getOnlineUsers: () => {
		const users = [];
		client.users.forEach(user => {
			if (user.presence.status !== "offline")
				users.push(user);
		});
		users.sort((a, b) => a.username.toUpperCase() > b.username.toUpperCase());
		return users;
	},

	getUserPresence: (target) => {
		let user;
		client.users.forEach(u => {
			if (u.username + '#' + u.discriminator === target) {
				user = u;
			}
		});
		if (user) {
			return user.presence;
		}
	},

	getLatestMessages: () => {
		let promise = null;
		client.channels.forEach(channel => {
			if (channel.name === CHANNEL_NAME) {
				promise = channel.fetchMessages({limit: 50});
			}
		});
		return promise || new Promise((resolve, reject) => resolve([]));
	},

	getLatestAnnouncement: () => {
		let promise = null;
		client.channels.forEach(channel => {
			if (channel.name === CHANNEL_ANOUNCEMENT) {
				promise = channel.fetchMessages({limit: 10});
			}
		});
		return promise || new Promise((resolve, reject) => resolve([]));
	},

	sendPrivateMessage: sendPrivateMessage,

	mentions: (message, url, byName, topicName) => {
		const pattern = /\B@[a-z0-9_-]+/gi;
		const mentions = message.match(pattern);
		const usernames = [];
		if (mentions && mentions.length) {
			mentions.forEach(mention => {
				const username = mention.substring(1);
				usernames.push(username);
			});
			User.model.find({
				key: {$in: usernames},
			}).select("personnal.discord").exec((err, users) => {
				if (err) {
					winston.warn(`Unable to get users for mentions.`);
					return;
				}

				users.forEach(user => {
					if (user.personnal && user.personnal.discord) {
						sendPrivateMessage(user.personnal.discord,
							`Vous avez été mentionné par ${byName} dans le sujet "${topicName}".`,
							{
								embed: {
									title: `Mentionné dans: "${topicName}"`,
									url: process.env.BASE_URL + url,
								}
							});
					}
				});

			});
		}
	},
};
