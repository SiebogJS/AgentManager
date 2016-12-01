'use strict';

/**
 * Exports
 * */
module.exports.ACLMessage = function (sender, performative, receivers) {
    return new ACLMessage(sender, performative, receivers);
};

module.exports.ACLMakeReply = ACLMakeReply;


/**
 * Represents a FIPA ACL message. Refer to <a
 * href="http://www.fipa.org/specs/fipa00061/SC00061G.pdf">FIPA ACL Message Structure Specification</a>
 * for more details.
 *
 * @constructor
 * @this {ACLMessage}
 * @param {AID} sender;
 * @param {number} performative Message ACLPerformative.
 * @param {AID[]} receivers Array of receiver Agents.
 */
function ACLMessage(sender, performative, receivers) {
    this.performative = performative;
    this.receivers = receivers || [];
    this.sender = sender;
    this.replyTo = '';
    this.content = null;
    this.contentObj = null;
    this.userArgs = null;
    this.language = null;
    this.encoding = null;
    this.ontology = '';
    this.protocol = '';
    this.conversationId = '';
    this.replyWith = '';
    this.inReplyTo = '';
    this.replyBy = -1;

}

/**
 * Returns a reply for the given message, filling-in the as much fields as possible.
 *
 * @param {ACLMessage} msg Received ACLMessage object.
 * @param {number} performative Performative to use in the reply.
 * @param {AID} sender Sender of the reply.
 * @returns {ACLMessage} ACLMessage object representing the reply.
 */
function ACLMakeReply(msg, performative, sender) {
    var reply = new ACLMessage(performative);
    reply.sender = sender;
    
    if (!msg.replyTo)
        reply.receivers.push(msg.replyTo);
    else if (!msg.sender)
        reply.receivers.push(msg.sender);
   
    if (!msg.language)
        reply.language = msg.language;
   
    if (!msg.ontology)
        reply.ontology = msg.ontology;
   
    if (!msg.encoding)
        reply.encoding = msg.encoding;
   
    if (!msg.protocol)
        reply.protocol = msg.protocol;
   
    if (!msg.conversationId)
        reply.conversationId = msg.conversationId;
   
    if (!msg.replyWith)
        reply.inReplyTo = msg.replyWith;
  
    return reply;
}