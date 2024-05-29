import { LightningElement } from 'lwc';
const DELAY=300;
export default class MovieSearch extends LightningElement {

movietype='';
selectedsearch= '';
selectedPageNo = "1";
loading = false;
displaytimeout;
get typeoptions() {
        return [
            { label: 'NONE', value: 'NONE' },
            { label: 'movie', value: 'Movie' },
            { label: 'episode', value: 'episode' },
            { label: 'series', value: 'series' },
        ];
    }

    handleChange(event){
        let{name, value} = event.target;
        this.loading = true;
        if(name === 'type'){
            this.movietype = value;
        }else if(name === 'searchName'){
            this.selectedsearch = value;
            this.loading = true;
        }else if(this.name === 'page'){
            this.selectedPageNo = value;
        }
        //debouncing Concept
        clearTimeout(this.displaytimeout);
       this.displaytimeout = setTimeout(() => {
            this.searchMovie();
        },DELAY);
    }
    searchMovie(){

    }
}