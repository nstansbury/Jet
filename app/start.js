	load("app/modules/base.jsm");

	RegisterNS("Jet");
	RegisterAlias("Lib", GetFile("app/libraries"));
	RegisterAlias("Res", GetFile("app/res"));
	RegisterAlias("Tests", GetFile("tests"));
	
	Trace.enabled = true;

	ImportNS("Jet", this);
	
	Jet.start(arguments);
	
	