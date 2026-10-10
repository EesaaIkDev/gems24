const reaches = (message, at, id) =>
  !!at && (Date.parse(message.created_date) < Date.parse(at) ||
    (message.created_date === at && message.id === id));

export function deliveryStatus(message, conversation, viewerId, showRead) {
  if (!message?.id || !conversation || !viewerId) return "sent";
  const side = conversation.participant_a_id === viewerId ? "b" : "a";
  if (showRead && conversation[`read_message_id_${side}`] &&
    reaches(message, conversation[`read_at_${side}`], conversation[`read_message_id_${side}`])) return "read";
  if (reaches(message, conversation[`delivered_at_${side}`], conversation[`delivered_message_id_${side}`])) return "delivered";
  return "sent";
}
