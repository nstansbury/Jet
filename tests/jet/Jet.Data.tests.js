	
	describe("Namespace :: Jet.Data", function() {
		ImportNS("Jet");
		ImportNS("Jet.Data");
		
		var element = '<element name="{name}" attribute="{attribute}">\
									<ul>[ul]<ul><ol>[ol]</ol>\
								</element>'
	
		var listitem = '<li value="{value}">{content}</li>'
	
		it("Exports Symbols", function () {
			expect(Jet.Data).toBeDefined();
			expect(Jet.Data.TemplateFactory).toBeDefined();
			expect(Jet.Data.DataTemplate).toBeDefined();
		});
		
		it("Imports Templates", function()	{
			Jet.Data.TemplateFactory.importTemplate("Element", element);
			Jet.Data.TemplateFactory.importTemplate("Listitem", listitem);
			
			expect(Jet.Data.TemplateFactory.getTemplate("Element")).toBeDefined();
			expect(Jet.Data.TemplateFactory.getTemplate("Listitem")).toBeDefined();
		});
		
		it("Creates Templates", function()	{
			var template = new Jet.Data.DataTemplate("Element");
			expect(template.name).toBeDefined();
			expect(template.attribute).toBeDefined();
			expect(template.ul.push).toBeDefined();		// We don't toBe(Array) because it's a wrapped array object
			expect(template.ol.push).toBeDefined();
		});
		
		it("Implements Getters & Setters", function()	{
			var template1 = new Jet.Data.DataTemplate("Element");
			var template2 = new Jet.Data.DataTemplate("Element");
			
			template1.name = "Template1 Name";
			template2.name = "Template2 Name";
			expect(template1.name).toBe("Template1 Name");
			expect(template2.name).toBe("Template2 Name");
			
			var item1 = new Jet.Data.DataTemplate("Listitem");
			var item2 = new Jet.Data.DataTemplate("Listitem");
			template1.ul.push(item1);
			template1.ul.push(item2);
			expect(template1.ul.length).toBe(2);
			
		})

		it("Outputs Templates", function()	{
			var template = new Jet.Data.DataTemplate("Element");
			template.name = "TemplateName"
			
			var item = new Jet.Data.DataTemplate("Listitem");
			item.value = "ItemValue";
			template.ul.push(item);
			
			var out = template.toString();
			
			expect(out).toContain("TemplateName");
			expect(out).toContain("ItemValue");
		})
	
	});

