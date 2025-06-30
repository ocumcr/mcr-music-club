"use strict";import{ContentEvents as c}from"../EventHandlers/ContentEvents.js";import{Record as o}from"../Record.js";export class Content{static debugLog;static content;static#t;static init(){this.debugLog=document.getElementById("debug-log"),this.content=document.querySelector(".content"),this.#t=document.querySelector(".musics")}static addLog(t){console.log(t),this.debugLog.innerHTML+=t+"<br />"}static fadeIn(){this.content.classList.remove("fade-in"),requestAnimationFrame(()=>{this.content.classList.add("fade-in")})}static scrollTo(t){t<=0?window.scrollTo({top:0,behavior:"smooth"}):document.querySelectorAll(".track")[t-1].scrollIntoView({behavior:"smooth"})}static renderPlaylist(t){this.#t.innerHTML=t.map(this.#e).join(""),c.setupTrackClickEvents(t),o.playCountRecord&&this.setPlayCount(t,o.playCountRecord)}static#e(t){const e=t.tags.map(s=>`<button class="tag-button">#${s}</button>`).join("");return`
            <li class="track">
                <div class="img-box" style="
                    background: url(${t.thumbnail});
                    background-size: cover;
                ">
                    <i class="fa-solid fa-circle-play"></i>
                    <i class="fa-solid fa-circle-pause"></i>
                </div>
                <div class="description">
                    <h3>${t.title}</h3>
                    <p>${t.year}</p>
                    <p class="author">${t.author}</p>
                    <p>${t.description}</p>
                    <div class="tags">
                        ${e}
                    </div>
                </div>
                <div class="play-count">\u53D6\u5F97\u4E2D...</div>
            </li>
        `}static setPlayCount(t,e){const s=document.querySelectorAll(".play-count");t.forEach((i,a)=>{s[a].innerText="\u518D\u751F\u56DE\u6570: "+(e[i.title]??0)})}static updatePlayingClass(t){this.#t.querySelectorAll(".track").forEach((e,s)=>e.classList.toggle("playing",s===t))}}
