import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @ViewChild('top')
  set top(el: ElementRef) {
    el.nativeElement.scrollTo();
  };

}
