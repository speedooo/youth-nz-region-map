var ageConverter, ethnicityConverter, genderConverter, offenceConverter, outcomeConverter, regionsConverter;

ethnicityConverter = {
    C: 'European',
    M: 'Maori',
    O: 'Other',
    P: 'Pacific People',
    X: 'Unknown'
};

offenceConverter = {
    '01': 'Homicide And Related Offences',
    '02': 'Acts Intended To Cause Injury',
    '03': 'Sexual Assault And Related Offences',
    '04': 'Dangerous Or Negligent Acts Endangering Persons',
    '05': 'Abduction, Harassment And Other Offences Against The Person',
    '06': 'Robbery, Extortion And Related Offences',
    '07': 'Unlawful Entry With Intent/Burglary, Break And Enter',
    '08': 'Theft And Related Offences',
    '09': 'Fraud, Deception And Related Offences',
    '10': 'Illicit Drug Offences',
    '11': 'Prohibited And Regulated Weapons And Explosives Offences',
    '12': 'Property Damage And Environmental Pollution',
    '13': 'Public Order Offences',
    '14': 'Traffic And Vehicle Regulatory Offences',
    '15': 'Offences Against Justice Procedures, Government Security And Government Operations',
    '16': 'Miscellaneous Offences'
};

outcomeConverter = {
    '1': 'Conviction',
    'A': 'Youth Court Proved',
    'B': 'Youth Court Discharge',
    'C': 'Withdrawn, not proved, other'
};

ageConverter = {
    '12-13': '12-13',
    '14': '14',
    '15': '15',
    '16': '16',
    'X': 'Unknown'
};

genderConverter = {
    'F': 'Female',
    'M': 'Male',
    'X': 'Unknown'
};

regionsConverter = {
    AUK: 'Auckland',
    BOP: 'Bay of Plenty',
    CAN: 'Canterbury',
    GIS: 'Gisborne',
    HKB: "Hawke's Bay",
    MWT: 'Manawatu-Whanganui',
    MBH: 'Marlborough',
    NSN: 'Nelson',
    NTL: 'Northland',
    OTA: 'Otago',
    STL: 'Southland',
    TAS: 'Tasman',
    TKI: 'Taranaki',
    WKO: 'Waikato',
    WGN: 'Wellington',
    WTC: 'West Coast',
    XXX: 'Others'
};


d3.csv("data/youth.csv", function (data) {
    var age, age_chart, all, countByAge, countByRegion, countByEthnicity, countByGender, countByOffence, countByOutcome, countByYear, ethnicity, regions, region_chart, ethnicity_chart, gender, gender_chart, ndx, offence, offence_chart, outcome, outcome_chart, reset_widths, year, year_chart;
    ndx = crossfilter(data);
    all = ndx.groupAll();

    age = ndx.dimension(function (d) {
        return d["age"];
    });
    countByAge = age.group().reduceSum(function (d) {
        return d.value;
    });
    year = ndx.dimension(function (d) {
        return d["year"];
    });
    countByYear = year.group().reduceSum(function (d) {
        return d.value / 1000;
    });
    offence = ndx.dimension(function (d) {
        return d["offence"];
    });
    countByOffence = offence.group().reduceSum(function (d) {
        return d.value;
    });
    outcome = ndx.dimension(function (d) {
        return d["outcome"];
    });
    countByOutcome = outcome.group().reduceSum(function (d) {
        return d.value;
    });
    gender = ndx.dimension(function (d) {
        return d["gender"];
    });
    countByGender = gender.group().reduceSum(function (d) {
        return d.value;
    });
    ethnicity = ndx.dimension(function (d) {
        return d["ethnicity"];
    });
    countByEthnicity = ethnicity.group().reduceSum(function (d) {
        return d.value;
    });
    regions = ndx.dimension(function (d) {
        return d["region"];
    });
    countByRegion = regions.group().reduceSum(function (d) {
        return d.value;
    });

    d3.json("../geo/states_nzl.topojson", function (error, nz) {
        var statesJson = topojson.feature(nz, nz.objects.states);
        var projection = d3.geo.mercator()
            .center([193.5, -45])
            .scale(1000)
        region_chart = dc.geoChoroplethChart("#region-chart")
            .width(350)
            .height(330)
            .dimension(regions)
            .group(countByRegion)
            .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
            .colorDomain([0, 100])
            .colorCalculator(function (d) {
                return d ? region_chart.colors()(d) : '#ccc';
            })
            .overlayGeoJson(statesJson.features, "state", function (d) {
                return (d.properties.code).substring(3);
            })
            .projection(projection)
            .title(function (d) {
                return "Region: " + regionsConverter[d.key] + "\nTotal: " + d.value;
            });

        year_chart = dc.barChart("#year-chart").width($("#year-chart").width()).height(250).dimension(year).group(countByYear).elasticY(true).xAxisPadding(50).xUnits(dc.units.integers).x(d3.scale.linear().domain([1991, 2013])).y(d3.scale.linear()).centerBar(true).renderHorizontalGridLines(true).renderVerticalGridLines(true).title(function (d) {
            return "Value: " + d.value;
        }).renderTitle(true);
        year_chart.xAxis().tickFormat(function (v) {
            return v;
        });

        age_chart = dc.pieChart("#age-chart").width(80).height(80).radius(35).innerRadius(15).dimension(age).group(countByAge).title(function (d) {
            return ageConverter[d.key] + " (" + d.value + ")";
        }).renderTitle(true).label(function (d) {
                return ageConverter[d.key];
            }).renderLabel(true).colors(d3.scale.ordinal().range(['red','green','blue']));


        ethnicity_chart = dc.rowChart("#ethnicity-chart").width(200).height(200).dimension(ethnicity).group(countByEthnicity).elasticX(true).gap(7).label(function (d) {
            return ethnicityConverter[d.key];
        }).title(function (d) {
                return ethnicityConverter[d.key] + " (" + d.value + ")";
            }).renderLabel(true).xAxis().ticks(3);


        gender_chart = dc.pieChart("#gender-chart").width(80).height(80).radius(35).innerRadius(15).dimension(gender).group(countByGender).renderLabel(false).title(function (d) {
            return genderConverter[d.key] + " (" + d.value + ")";
        }).renderTitle(true).label(function (d) {
                return genderConverter[d.key];
            }).renderLabel(true).colors(d3.scale.ordinal().range(['red','green','blue']));

        outcome_chart = dc.rowChart("#outcome-chart").width(200).height(170).dimension(outcome).group(countByOutcome).elasticX(true).gap(7).label(function (d) {
            return outcomeConverter[d.key];
        }).title(function (d) {
                return outcomeConverter[d.key] + " (" + d.value + ")";
            }).renderLabel(true).xAxis().ticks(3);


        offence_chart = dc.rowChart("#offence-chart").width($("#offence-chart").width()).height(500).dimension(offence).group(countByOffence).elasticX(true).gap(7).label(function (d) {
            return offenceConverter[d.key < 10 ? "0" + d.key : d.key];
        }).title(function (d) {
                return offenceConverter[d.key < 10 ? "0" + d.key : d.key] + " (" + d.value + ")";
            }).renderLabel(true).xAxis().ticks(4);
        dc.dataCount("#data-count").dimension(ndx).group(all);
        return dc.renderAll();

    })

});
