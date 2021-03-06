var test = require('tape')
var step = require('../').step
var esprima = require('esprima').parse

test('expression statement', function (t) {
  t.plan(1)

  var node = esprima('hello').body[0]
  t.is(step(node), 1, 'walks expression statement')
})

test('block statement', function (t) {
  t.plan(1)

  var node = esprima('if(foo){bar();baz()}').body[0].consequent
  t.is(step(node), 2, 'walks block statement')
})

test('empty statement', function (t) {
  t.plan(1)

  var node = esprima(';').body[0]
  t.is(step(node), null, 'does not walk empty statement')
})

test('debugger statement', function (t) {
  t.plan(1)

  var node = esprima('debugger').body[0]
  t.is(step(node), null, 'does not walk debugger statement')
})

test('with statement', function (t) {
  t.plan(1)

  var node = esprima('with(foo){bar();baz()}').body[0]
  t.is(step(node), 2, 'walks with statement')
})

test('return statement', function (t) {
  t.plan(2)

  var node = esprima('function f(){return 123}').body[0].body.body[0]
  t.is(step(node), 1, 'walks return statement')

  var empty = esprima('function f(){return;}').body[0].body.body[0]
  t.is(step(empty), null, 'does not walk empty return statement')
})

test('labeled statement', function (t) {
  t.plan(1)

  var node = esprima('foo:for(var i of bar){baz();qux()}').body[0]
  t.is(step(node), 2, 'walks labeled statement')
})

test('break statement', function (t) {
  t.plan(2)

  var node = esprima('foo:while(bar){break foo}').body[0].body.body.body[0]
  t.is(step(node), 1, 'walks break statement')

  var empty = esprima('foo:while(bar){break}').body[0].body.body.body[0]
  t.is(step(empty), null, 'does not walk empty break statement')
})

test('continue statement', function (t) {
  t.plan(2)

  var node = esprima('foo:while(bar){continue foo}').body[0].body.body.body[0]
  t.is(step(node), 1, 'walks continue statement')

  var empty = esprima('foo:while(bar){continue}').body[0].body.body.body[0]
  t.is(step(empty), null, 'does not walk empty continue statement')
})

test('if statement', function (t) {
  t.plan(2)

  var node = esprima('if(foo&&bar){baz();qux()} ').body[0]
  t.is(step(node), 2, 'walks if statement')

  var alt = esprima('if(foo){baz()}else{qux()}').body[0]
  t.is(step(alt), 3, 'walks if/else statement')
})

test('switch statement', function (t) {
  t.plan(1)

  var node = esprima('switch(foo){case 1:{break}case 2:{break}}').body[0]
  t.is(step(node), 3, 'walks switch statement')
})

test('switch case', function (t) {
  t.plan(2)

  var node = esprima('switch(foo){case 1:{bar();break}}').body[0].cases[0]
  t.is(step(node), 2, 'walks switch case')

  var def = esprima('switch(foo){default:{bar();break}}').body[0].cases[0]
  t.is(step(def), 1, 'walks default switch case')
})

test('throw statement', function (t) {
  t.plan(1)

  var node = esprima('throw 123').body[0]
  t.is(step(node), 1, 'walks throw statement')
})

test('try statement', function (t) {
  t.plan(3)

  var node = esprima('try{a()}catch(e){b()}').body[0]
  t.is(step(node), 2, 'walks try/catch statement')

  var tryCatFin = esprima('try{a()}catch(e){b()}finally{c()}').body[0]
  t.is(step(tryCatFin), 3, 'walks try/catch/finally statement')

  var tryFin = esprima('try{a()}finally{c()}').body[0]
  t.is(step(tryFin), 2, 'walks try/finally statement')
})

test('catch clause', function (t) {
  t.plan(1)

  var node = esprima('try{a()}catch(e){b();c()}').body[0].handler
  t.is(step(node), 2, 'walks catch clause')
})

test('while statement', function (t) {
  t.plan(2)

  var node = esprima('while(foo){a();b()}').body[0]
  t.is(step(node), 2, 'walks while statement')

  var doWhile = esprima('do{a();b()}while(foo)').body[0]
  t.is(step(doWhile), 2, 'walks do/while statement')
})

test('for statement', function (t) {
  t.plan(6)

  var node = esprima('for(var i=100;i>0;i--){a()}').body[0]
  t.is(step(node), 4, 'walks for statement')

  var node2 = esprima('for(;i--;foo){a()}').body[0]
  t.is(step(node2), 3, 'walks for statement (without init)')

  var node3 = esprima('for(;;foo){a()}').body[0]
  t.is(step(node3), 2, 'walks for statement (without init and test)')

  var node4 = esprima('for(;;){a()}').body[0]
  t.is(step(node4), 1, 'walks for statement (without any)')

  var forIn = esprima('for(var i in b){i()}').body[0]
  t.is(step(forIn), 3, 'walks for/in statement')

  var forOf = esprima('for(var i of b){i()}').body[0]
  t.is(step(forOf), 3, 'walks for/of statement')
})
