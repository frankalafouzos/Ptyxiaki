// FilterForm.js
import React from "react";
import { Form } from "react-bootstrap";

const FilterForm = ({
  categoryFilter,
  setCategoryFilter,
  locationFilter,
  setLocationFilter,
  maxPrice,
  setMaxPriceFilter,
  minPrice,
  setMinPriceFilter,
  Sort,
  setSort,
}) => {
  return (
    <>
    <Form className="filters">
      <Form.Group className="form-group">
        <Form.Label>Category</Form.Label>
        <Form.Control
          className="categories"
          as="select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Italian">Italian</option>
          <option value="Greek">Greek</option>
          <option value="French">French</option>
          <option value="Chinese">Chinese</option>
          <option value="Mexican">Mexican</option>
          <option value="American">American</option>
          <option value="Turkish">Turkish</option>
          <option value="Street food">Street food</option>
        </Form.Control>
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Location</Form.Label>
        <Form.Control
          className="locations"
          as="select"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="Acharnes">Acharnes</option>
          <option value="Aegina">Aegina</option>
          <option value="Afidnes">Afidnes</option>
          <option value="Agia Marina">Agia Marina</option>
          <option value="Agia Paraskevi">Agia Paraskevi</option>
          <option value="Agia Varvara">Agia Varvara</option>
          <option value="Agios Panteleimon">Agios Panteleimon</option>
          <option value="Agios Dimitrios Kropias">
            Agios Dimitrios Kropias
          </option>
          <option value="Agios Dimitrios">Agios Dimitrios</option>
          <option value="Agios Ioannis Rentis">Agios Ioannis Rentis</option>
          <option value="Aianteio">Aianteio</option>
          <option value="Ampelakia">Ampelakia</option>
          <option value="Anavyssos">Anavyssos</option>
          <option value="Anoixi">Anoixi</option>
          <option value="Anthousa">Anthousa</option>
          <option value="Argithea">Argithea</option>
          <option value="Argyroupoli">Argyroupoli</option>
          <option value="Artemida">Artemida</option>
          <option value="Aspropyrgos">Aspropyrgos</option>
          <option value="Athens">Athens</option>
          <option value="Avlonas">Avlonas</option>
          <option value="Agioi Anargyroi">Agioi Anargyroi</option>
          <option value="Agios Stefanos">Agios Stefanos</option>
          <option value="Alimos">Alimos</option>
          <option value="Ano Liosia">Ano Liosia</option>
          <option value="Agioi Apostoloi">Agioi Apostoloi</option>
          <option value="Ilion">Ilion</option>
          <option value="Ydra">Ydra</option>
          <option value="Chaïdari">Chaïdari</option>
          <option value="Cholargos">Cholargos</option>
          <option value="Dhafni">Dhafni</option>
          <option value="Dhrafi">Dhrafi</option>
          <option value="Dioni">Dioni</option>
          <option value="Dionysos">Dionysos</option>
          <option value="Drapetsona">Drapetsona</option>
          <option value="Drosia">Drosia</option>
          <option value="Ekali">Ekali</option>
          <option value="Elefsina">Elefsina</option>
          <option value="Elliniko">Elliniko</option>
          <option value="Erythres">Erythres</option>
          <option value="Filothei">Filothei</option>
          <option value="Fyli">Fyli</option>
          <option value="Galatas">Galatas</option>
          <option value="Galatsi">Galatsi</option>
          <option value="Gerakas">Gerakas</option>
          <option value="Glyfada">Glyfada</option>
          <option value="Grammatiko">Grammatiko</option>
          <option value="Ilioupoli">Ilioupoli</option>
          <option value="Irakleio">Irakleio</option>
          <option value="Kaisariani">Kaisariani</option>
          <option value="Kalyvia Thorikou">Kalyvia Thorikou</option>
          <option value="Kallithea">Kallithea</option>
          <option value="Kamateron">Kamateron</option>
          <option value="Kapandriti">Kapandriti</option>
          <option value="Karellas">Karellas</option>
          <option value="Kalamos">Kalamos</option>
          <option value="Kato Soulion">Kato Soulion</option>
          <option value="Kitsi">Kitsi</option>
          <option value="Kythira">Kythira</option>
          <option value="Keratea">Keratea</option>
          <option value="Keratsini">Keratsini</option>
          <option value="Khalandrion">Khalandrion</option>
          <option value="Khalkoutsion">Khalkoutsion</option>
          <option value="Kifisia">Kifisia</option>
          <option value="Kineta">Kineta</option>
          <option value="Kipseli">Kipseli</option>
          <option value="Koropi">Koropi</option>
          <option value="Korydallos">Korydallos</option>
          <option value="Kouvaras">Kouvaras</option>
          <option value="Kryoneri">Kryoneri</option>
          <option value="Kypseli">Kypseli</option>
          <option value="Lavrio">Lavrio</option>
          <option value="Leondarion">Leondarion</option>
          <option value="Limin Mesoyaias">Limin Mesoyaias</option>
          <option value="Lykovrysi">Lykovrysi</option>
          <option value="Magoula">Magoula</option>
          <option value="Marathonas">Marathonas</option>
          <option value="Markopoulo">Markopoulo</option>
          <option value="Markopoulo Oropou">Markopoulo Oropou</option>
          <option value="Marousi">Marousi</option>
          <option value="Mandra">Mandra</option>
          <option value="Megara">Megara</option>
          <option value="Megalochori">Megalochori</option>
          <option value="Melissia">Melissia</option>
          <option value="Metamorfosi">Metamorfosi</option>
          <option value="Moskhaton">Moskhaton</option>
          <option value="Nea Chalkidona">Nea Chalkidona</option>
          <option value="Nea Erythraia">Nea Erythraia</option>
          <option value="Nea Filadelfeia">Nea Filadelfeia</option>
          <option value="Nea Ionia">Nea Ionia</option>
          <option value="Nea Makri">Nea Makri</option>
          <option value="Nea Palatia">Nea Palatia</option>
          <option value="Nea Peramos">Nea Peramos</option>
          <option value="Nea Penteli">Nea Penteli</option>
          <option value="Nea Smyrni">Nea Smyrni</option>
          <option value="Neo Psychiko">Neo Psychiko</option>
          <option value="Nikaia">Nikaia</option>
          <option value="Neos Voutzas">Neos Voutzas</option>
          <option value="Oropos">Oropos</option>
          <option value="Paiania">Paiania</option>
          <option value="Palaia Fokaia">Palaia Fokaia</option>
          <option value="Palaio Faliro">Palaio Faliro</option>
          <option value="Pallini">Pallini</option>
          <option value="Papagou">Papagou</option>
          <option value="Pefki">Pefki</option>
          <option value="Perama">Perama</option>
          <option value="Poros">Poros</option>
          <option value="Penteli">Penteli</option>
          <option value="Peristeri">Peristeri</option>
          <option value="Petroupolis">Petroupolis</option>
          <option value="Pikermi">Pikermi</option>
          <option value="Piraeus">Piraeus</option>
          <option value="Polydendri">Polydendri</option>
          <option value="Psychiko">Psychiko</option>
          <option value="Rafina">Rafina</option>
          <option value="Rodopoli">Rodopoli</option>
          <option value="Salamina">Salamina</option>
          <option value="Saronida">Saronida</option>
          <option value="Selinia">Selinia</option>
          <option value="Skarmagkas">Skarmagkas</option>
          <option value="Skala Oropou">Skala Oropou</option>
          <option value="Spata">Spata</option>
          <option value="Spetses">Spetses</option>
          <option value="Stamata">Stamata</option>
          <option value="Tavros">Tavros</option>
          <option value="Thrakomakedones">Thrakomakedones</option>
          <option value="Varnavas">Varnavas</option>
          <option value="Varybobi">Varybobi</option>
          <option value="Vathy">Vathy</option>
          <option value="Vari">Vari</option>
          <option value="Vilia">Vilia</option>
          <option value="Vyronas">Vyronas</option>
          <option value="Vlychada">Vlychada</option>
          <option value="Voula">Voula</option>
          <option value="Vouliagmeni">Vouliagmeni</option>
          <option value="Vrana">Vrana</option>
          <option value="Vrilissia">Vrilissia</option>
          <option value="Ymittos">Ymittos</option>
          <option value="Zefyri">Zefyri</option>
          <option value="Zografos">Zografos</option>
        </Form.Control>
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Min Price</Form.Label>
        <Form.Control
          className="minPrice"
          type="number"
          value={minPrice}
          onChange={(e) => setMinPriceFilter(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Max Price</Form.Label>
        <Form.Control
          className="maxPrice"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPriceFilter(e.target.value)}
        />
      </Form.Group>

    </Form>
        </>
  );
};

export default FilterForm;
