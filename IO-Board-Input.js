
var relayState = {
    RLY1:"",RLY2:"",RLY3:"",RLY4:"",RLY5:""
};

module.exports = function(RED) {

    function IoBoardNode(config) {
        RED.nodes.createNode(this,config);
        this.board = config.board;
        this.MAC = config.MAC;
		this.input = config.input;
        this.state = config.state;

        var node = this;
        this.on('input', function(msg) {
            
        	var state = node.state;
        	var board = node.board;
            var input = node.input;
        	var MAC = node.MAC;
            
            if(msg.payload.MAC !== MAC && msg.payload.device !== board) return;

            const {device,temp,status} = msg.payload
            
            if(state=="BUTTON"){
                if((input==="any" && msg.payload.deviceShadow.buttonTrigger!=0)|| input == msg.payload.deviceShadow.buttonTrigger){
                    if(msg.payload.hasOwnProperty("deviceShadow.buttonState")){
                        msg.payload.deviceShadow.buttonState = msg.payload.deviceShadow.buttonState==="high"? "high":"low"
                    }
                    
                    // msg.payload = {...msg.payload|msg.payload.deviceShadow}
                }else{
                    return
                }  
            }else{

                if(input==="any"){
                    var breakIsTrue = false;
                    for (var i = 1; i <= 5; i++){
                        if(relayState["RLY"+i] !== msg.payload.deviceShadow.relayState["RLY"+i]){
                            relayState["RLY"+i] = msg.payload.deviceShadow.relayState["RLY"+i]
                            breakIsTrue = true;
                        }
                    }
                    if(!breakIsTrue){return;}

                }else if(relayState["RLY"+input] !== msg.payload.deviceShadow.relayState["RLY"+input]){
                    relayState["RLY"+input] = msg.payload.deviceShadow.relayState["RLY"+input]
                }else{
                    return
                }  
                // msg.payload = {...msg.payload||msg.payload.relayState}
            }
            
            node.send(msg);
        });
    }
    RED.nodes.registerType("IO-Board-Input",IoBoardNode);
}