
const { Controller, Tag, EthernetIP } = require('ethernet-ip')
const {INT, BOOL} = EthernetIP.CIP.DataTypes.Types;
const PLC = new Controller();

PLC.connect("192.168.2.10", 0).then(async () => {
	console.log('connected to '+PLC.properties.name)

	const frozen0shots = new Tag('frozen0.recipe_shot_count', 'MainProgram', INT);
	
	frozen0shots.value = 2;
	
	await PLC.writeTag(frozen0shots);



	const startRoutine = new Tag('startRoutine', 'MainProgram', BOOL);
	startRoutine.value = true;
	await PLC.writeTag(startRoutine);




}).catch(console.error);


