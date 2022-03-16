import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Element } from '@angular/compiler';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @ViewChild('top')
  set top(el: ElementRef) {
    el.nativeElement.scrollTo();
  };

}
