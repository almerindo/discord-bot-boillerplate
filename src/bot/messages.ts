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
];

export function randomMessage(): string {
  return sarcasticResponses[
    Math.floor(Math.random() * sarcasticResponses.length)
  ];
}
