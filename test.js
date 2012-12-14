var should = require("should");
var request = require("request");
var port = 221;

describe('Protolus', function(){
    describe('can', function(){
        var Protolus = require('./protolus-combined');
        var application;
        var running = false;
        before(function(done){
            application = Protolus.PanelServer({port:port});
            application.start(function(){
                running = true;
                done();
            });
        });
        
        it('run', function(){
            should.equal(running, true);
        });
        
        it('serve a response', function(done){
            request('http://localhost:'+port+'/index', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    body.should.not.equal('');
                }
                if(error) should.fail('Error fetching URL', error);
                if(response.statusCode != 200) should.fail('Fetch not OK', 'Code:'+response.statusCode);
                body.should.match(/Success/);
                done();
            });
        });
    });
});