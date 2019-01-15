/**
 * 1 => request id
 * 2 => method name
 * 3 => arguments
 */
declare type RequestMessage = [0, number, string, any[]];
/**
 * 1 => request id
 * 2 => error
 * 3 => result
 */
declare type ResponseMessage = [1, number, any | null, any | null];
/**
 * 1 => event name
 * 2 => arguments
 */
declare type NotificationMessage = [2, string, any[]];
declare type Message = RequestMessage | ResponseMessage | NotificationMessage;
