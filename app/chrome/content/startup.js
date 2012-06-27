System.Import( "Jet" );
System.Import( "Jet.DOM" );

for(var key in Jet.DOM)
	Console.WriteLine(key);

function loadStartup()   {
	Console.WriteLine("Starting Jet...");
	Jet.Core.Listen(8000);	
}