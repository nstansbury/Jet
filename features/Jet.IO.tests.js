
/*
	Apache <=> HTTP Service <=> ServiceController
	
	Service
	Master
		ServiceController
			Worker
				RequestController
				RequestDispatcher
					Slave
						RequestListener
						RequestHandler + Request
							register
							unregister
							execute
						
	
	SCENARIO("").
	END();

*/

	
SCENARIO("When a ServiceController is sent an unregistered request URI it returns a 404 response").
END();

SCENARIO("When a RequestController is created it can specifiy the number of RequestDispatchers to create").
END();

SCENARIO("When a RequestDispatcher is created it can specifiy the slave script to load").
END();

SCENARIO("When a RequestListener is sent a put request it can register all the RequestHandlers in the slave script").
END();

SCENARIO("When a RequestListener is updated successfully it returns a 200 response").
END();

SCENARIO("When a RequestListener is NOT updated successfully it returns a 500 response").
END();

SCENARIO("When a RequestListener is sent a request it executes the correct RequestHandler").
END();

SCENARIO("When a RequestListener is sent a get request it can return a list of all the RequestHandlers registered").
END();

SCENARIO("When a RequestController receives a request for a Master dispatch it is executed by the ServiceController").
END();

SCENARIO("When a RequestHandler is NOT executed successfully it returns a 500 response").
END();

