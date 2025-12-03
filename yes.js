// //Arrow function
// let name;
// const Yes = (name) => {
//     console.log("username : "+ " " + name);
// }

// console.log(Yes("ayush"));

// let a;
// let b;
// const add = (a, b) =>  a + b;


// console.log(add(2, 5));

// Objects

// const person = {
//     name: "ayush",
//     age: 40,
//     adult: true,
//     greet() {
//         console.log("Hi " + this.name + " " + this.age);
//     }
// }

// console.log(person.age);

// const person2 = {...person, yes: "yes", no: "no"}
// console.log(person2);

//Destructuring
// const printName = ({name}) => {
//     console.log(name);

// }
// printName(person);


// //Arrays
// const Name = ["ayu", "asshi", "ayush", " John"];
// for(let name of Name) {
//     console.log(name);
// }
// console.log(Name[2]);
// console.log(Name.map(Name => "name: " + Name
// ));

// Name.push("aarush");
// console.log(Name);

// //Rest and spead operator

// const array2 =  Name.slice();
// console.log(array2);

// const array3 =[...Name, "you", "Tumma", " Lamu"]
// console.log(array3);

// const yes = (...args) => {
//     return args;
// }
// console.log(yes(1,2,3,7,5));


//Asynchronous 

const fetchData = () => {
    const promise = new Promise((resolve, reject) => {
       setTimeout(() => {
        resolve("Done");
    }, 1500);
    
    });
      return promise;
};
setTimeout(() => {
    console.log("Done");
     fetchData().then(text => {
        console.log(text);
        return fetchData();
        }).then(text2 => {
            console.log(text2);
        });
    }, 3000);
console.log("Hello");
console.log("Hii");
