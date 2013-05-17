	
SCENARIO("When a Service Controller is sent an unregistered request URI it returns a 404 response").
END();

SCENARIO("When a Message Controller is created it can specifiy the number of Message Dispatchers to create").
END();

SCENARIO("When a Message Dispatcher is created it can specifiy the slave script to load").
END();

SCENARIO("When a Message Listener is sent a put request it can register all the Message Handlers in the slave script").
END();

SCENARIO("When a Message Listener is updated successfully it returns a 200 response").
END();

SCENARIO("When a Message Listener is NOT updated successfully it returns a 500 response").
END();

SCENARIO("When a Message Listener is sent a request it executes the correct Message Handler").
END();

SCENARIO("When a Message Listener is sent a get request it can return a list of all the Message Handlers registered").
END();

SCENARIO("When a Message Controller receives a request for a Master dispatch it is executed by the Message Controller").
END();

SCENARIO("When a Message Handler is NOT executed successfully it returns a 500 response").
END();

