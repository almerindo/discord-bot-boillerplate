// ./src/bot/messages.ts

export const sarcasticResponses = [
  "Sai daí 'oreia-seca'! Você precisa ganhar algumas credenciais primeiro para falar comigo!",
  'Ei, calma aí! Vai precisar de um pouco mais de poder para acessar esse comando.',
  "Sinto muito, mas esse comando está no 'nível ultra secreto'. Não é pra você!",
  'Opa! Parece que você precisa de algumas aulas de credenciais antes de continuar.',
  'Atenção, atenção! Temos um intruso sem autorização tentando acessar comandos secretos.',
  "Acho que você não tem clearance suficiente. Volte quando tiver, hmm... 'mais experiência'.",
  "Infelizmente, esse comando é só para os 'grandes'. Você ainda não chegou lá!",
  'Hmm, ainda não tem o acesso premium? Que triste!',
  "Ah, esse comando? Está bloqueado para 'oreias-secas' por razões de segurança. Nada pessoal!",
  'Você tentou, mas... sem autorização, sem comando. Melhor sorte da próxima vez!',
  'Ooooh, que triste! Parece que sua conta não cobre esses luxos.',
  "Parece que esse comando está no plano ouro... e você é usuário bronze.",
  'Espere um pouco, você realmente achou que tinha permissão para isso? Fofo!',
  'Não é sua culpa... é o sistema que insiste em manter as coisas exclusivas.',
  "Acesso negado! E, francamente, acho que você deveria saber disso antes mesmo de tentar.",
  'Sabe aquele ditado "sonhar não custa nada"? Exato, isso é só um sonho.',
  "Desculpa, mas você ainda está no estágio de 'observador'. Quem sabe um dia?",
  'Segurança máxima ativada! Você não passou no detector de relevância.',
  "Infelizmente, ainda está a alguns degraus de chegar nesse comando.",
  'Este comando está trancado e a chave só funciona para pessoas com credenciais. Ops!',
];

export function randomMessage(): string {
  return sarcasticResponses[
    Math.floor(Math.random() * sarcasticResponses.length)
  ];
}

// Mensagens para quando todos estão com tarefas em dia
export const onTimeResponses = [
  "Parece que todos estão com suas tarefas em dia! 🎉 Que milagre!",
  "Nada de atrasos por aqui! Alguém está treinando para o Prêmio de Pontualidade?",
  "Olha só! Parece que finalmente entenderam o conceito de 'prazo'. Que honra!",
  "Tudo em ordem? Quem são vocês e o que fizeram com os procrastinadores?",
  "Olha só! Todos em dia? Alguém deve ter desligado a Netflix!",
  "Inacreditável! Nenhuma tarefa atrasada. Será que estamos em um universo paralelo?",
  "Bom trabalho, pessoal! Ou foi sorte? De qualquer forma, aproveitem esse raro momento!",
  "Eficiência a mil por aqui! Quem diria que vocês poderiam ser tão pontuais?",
  "Parece que todos merecem uma medalha de honra ao mérito hoje!",
  "Parabéns! Nenhuma tarefa pendente... só posso estar sonhando.",
  "Todo mundo em dia? Alguém deve ter contratado um clone, né?",
  "Uau, sem atrasos! Tenho certeza de que o chefe vai achar que isso é uma pegadinha.",
  "Agora sim! Sem tarefas pendentes, e ninguém teve que puxar uma noitada!",
  "Finalmente! Parece que todos descobriram a magia da pontualidade.",
  "Uau! Até achei que tinha algo errado no sistema, mas está tudo certo.",
  "Parabéns, pessoal! Agora posso dormir em paz sabendo que o mundo está em ordem.",
  "Olha só! Parece que todos estão levando a sério o conceito de prazo. Coisa rara, hein?",
  "Milagre dos milagres! Todo mundo em dia! Será que o apocalipse está próximo?",
  "Olha isso! A produtividade bateu recorde! Estão treinando para as Olimpíadas?",
  "Alguém finalmente fez um pacto com a pontualidade. Orgulho define!",
];

export function getOnTimeMessage(): string {
  return onTimeResponses[
    Math.floor(Math.random() * onTimeResponses.length)
  ];
}

// Mensagens para tarefas atrasadas, com detalhes personalizáveis
export function getOverdueTaskMessage(username: string, code: string, days: number, description: string): string {
  const overdueResponses = [
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 😅 Alguém perdeu o conceito de prazo, hein?`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🕒 Vamos acelerar antes que vire lenda!`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 😬 A tarefa tá criando raízes!`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! ⏰ O relógio não para, sabia?`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🐢 Hora de sair da marcha lenta!`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 📆 Parece que essa vai para o Guinness de atrasos!`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! ⚠️ Melhor acabar antes que inventem um prêmio de "Maiores Atrasos".`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 📅 Será que podemos adicionar essa ao calendário de feriados?`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🎻 Precisa de música para trabalhar ou só um empurrãozinho?`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 📜 Alguém ouviu falar em prazos ou isso é novidade?`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🕰️ Acho que o conceito de "deadline" passou despercebido aqui.`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! ⏳ Que tal correr antes que vire relíquia histórica?`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🐌 Talvez a tartaruga te passe se não acelerar.`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🎬 Quando vai ser a estreia desse blockbuster?`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🧓 Acho que essa tarefa vai se aposentar antes de ser feita.`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 📌 Essa aqui já tá quase virando item de museu.`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! ⏳ Será que temos um recorde mundial de procrastinação?`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🚶 Cuidado, acho que a poeira já tá cobrindo essa.`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🌋 Essa tarefa tá mais parada que um vulcão extinto.`,
    `👤 **${username}** - Código da Tarefa: ${code} \n⏳ **Atraso**: ${days} dias! 🎡 Vai girar ou continua estacionada nessa roda-gigante de atraso?`,
  ];
  return `${overdueResponses[Math.floor(Math.random() * overdueResponses.length)]}\n📋 Descrição: ${description}`;
}
