import { CommandsList } from '../commands';

const commands = CommandsList.map(command => command.data.toJSON());

commands.forEach(v => console.log(JSON.stringify(v)));
process.exit(0);