<div id="top"></div>
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/FrancescoMarchiori/GANzone">
    <img src="https://i.postimg.cc/QMY0fPgx/lofi-girl.png" alt="Logo" width="150" height="150">
  </a>

  <h1 align="center">GANzone</h1>

  <p align="center">
    Machine Learning supported Lo-Fi Music Generator
    <br />
    <a href="https://lofi.jacobzhang.de/?default"><strong>Hear the results »</strong></a>
    <br />
    <br />
    <p align="center">Fork of <a href="https://github.com/jacbz/Lofi"><strong>jacbz/Lofi</strong></a></p>
  </p>
</div>

## 🎵 Lo-Fi

![](https://github.com/jacbz/lofi/actions/workflows/client.yml/badge.svg)

LOFI is a Machine Learning supported lo-fi music generator. The original authors trained a VAE model in [PyTorch](https://pytorch.org/) to represent a Lo-Fi track as a vector of 100 features. A Lo-Fi track consists of chords, melodies, and other musical parameters. The web client uses [Tone.js](https://tonejs.github.io/) to make a dusty lo-fi track out of these parameters.

<p align="center">
  <img src="https://repository-images.githubusercontent.com/377117802/d55ba858-636f-4c44-9195-94971754fec0" width="400px"/>
</p>

Click [here](http://lofi.jacobzhang.de/?default) for a pre-generated Lo-Fi playlist!

## ❓ Why this Fork

The main objectives of this fork are the following:

- [ ] Convert scripts in more readable Jupyter Notebook format
- [ ] Study the effect on the samples by changing architecture parameters
- [ ] Implement a simple `generateSample()` feature without relying on the client
- [ ] Implement an infinite loop feature, as the popular live-stream of Lofi Girl
