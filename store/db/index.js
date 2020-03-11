import {db} from '../../plugins/pouch'


/*** State **/
const state = {
    todos: [],
    newTodo: ''

};

/*** Getters **/
const getters = {
    getTodos(state) {
        return state.todos;
      },
};

/*** Mutations **/
const mutations = {
    setTodos(state, todo) {
        state.todos.push(todo);
    },
};

/*** Actions **/
const actions = {
    syncAll () {
      		//   let self = this;  
              db.allDocs({
                include_docs: true,
                attachments: true
            }).then(function (res) {
                console.log("Result..."+res);
               commit('setTodos', res)
            }).catch(function (err) {
                console.log(err);
            });

	
      }
};

export default {
    state,
    getters,
    mutations,
    actions
};
