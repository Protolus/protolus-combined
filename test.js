var should = require("should");

describe('Protolus.Templates', function(){
    describe('can render', function(){
        var Templates = require('./protolus-templates');
        before(function(){
            Templates({
                templateDirectory : '/Panels',
                scriptDirectory : '/Scripts'
            });
        });
        
        it('a simple panel', function(done){
            new Templates.Panel('simple', function(panel){
                panel.render({} , function(html){
                    html.indexOf('OMG').should.not.equal(-1);
                    done();
                });
            });
        });
        
        it('an if macro', function(done){
            new Templates.Panel('if', function(panel){
                var data = {
                    test : 'blah'
                };
                panel.render(data , function(html){
                    html.indexOf('YES').should.not.equal(-1);
                    done();
                });
            });
        });
        
        it('a foreach macro', function(done){
            new Templates.Panel('foreach', function(panel){
                var data = {
                    test : 'blah',
                    list : [ 'foo', 'bar', 'baz' ]
                };
                panel.render(data , function(html){
                    html.indexOf('<h2>'+data.test+'</h2>').should.not.equal(-1);
                    data.list.forEach(function(value, key){
                        html.indexOf('<a>'+key+'</a>').should.not.equal(-1);
                        html.indexOf('<b>'+value+'</b>').should.not.equal(-1);
                    });
                    done();
                });
            });
        });
        
        it('a full page with target insertion and wrapper', function(done){
            Templates.renderPage('page', function(html){
                html = Templates.insertTextAtTarget('inserted', 'head', html);
                html.indexOf('<h2>excellent</h2>').should.not.equal(-1);
                html.indexOf('<div>blah</div>').should.not.equal(-1);
                html.indexOf('inserted').should.not.equal(-1);
                done();
            });
        });
        
        it('a page with subpanels', function(done){
            Templates.renderPage('parent', function(html){
                html.indexOf('made_it').should.not.equal(-1);
                done();
            });
        });
        
    });
});