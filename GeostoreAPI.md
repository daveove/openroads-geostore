# Geostore API


The Geostore API provides third-party developers and data analysts the capability to integrate with the Geostore by using the Application Programming Interface (API). This document outlines its specifications.


## Base URL: http://openroads-geostore.appspot.com


### List Projects

#### GET /api/v1/data?type=PROJECT

List Projects

Parameters:

- **n** - A number. If provided, will return the number of projects indicated. Defaults to 50. Maximum of 100. _*optional_
- **type** - Required. Must be set to **PROJECT**
- **project_code** - Filter the results by the given Project Code _*optional_
- **program** - Filter the results by the given Program. Options are PRDP, GAA, BUB, and TRIP. _*optional_
- **has_kml** - Set to `1` to only return results that have a KML Track. _*optional_
- **has_image** - Set to `1` to only return results that have an Image. _*optional_
- **has_classification** - Set to `1` to only return results that has an Image that was already geoprocessed. _*optional_
- **csv** - Set to `1` to return results as a CSV export. _*optional_

Example: http://openroads-geostore.appspot.com/api/v1/data?type=PROJECT&program=PRDP&n=1

Response body:

```json
{
    code: 200,
    type: "List of geostore saved data.",
    response: "OK",
    cursor: "CmcKGQoMY3JlYXRlZF90aW1lEgkI0ILbo8-BzAISRmoUc35vcGVucm9hZHMtZ2Vvc3RvcmVyLgsSB0FQSURhdGEiIVBSRFAtSUItUjAwMy1aQU0tMDA1LTAwMC0wMDAtMjAxNQwYACAB",
    data: [
        {
            status: "On-going drafting of FS / DED",
            updated_timestamp_utc: 1460398337,
            code: "PRDP-IB-R003-TAR-004-000-000-2015",
            meta: {
                issuance_of_ntp_-_check: "",
                1st_tranche_-lp_amount: "",
                click_to_view_/_download_the_geotag_files: "DOWNLOAD",
                linear_meter_for_fmr_w/_bridge_sp: "",
                actual_physical_progress: "0",
                endorsed_for_issuance_of_nol_1: "",
                actual_disbursement_cumulative-lgu_equity: "",
                total_number_of_beneficiaries__ip_&_non-ip: "0",
                under_fs_/_ded_preparation: "",
                female_beneficiaries_ip: "",
                date_of_release_check: "",
                4th_tranche_-lp_amount: "",
                household_check: "",
                latitude: "",
                geofile_count: "0",
                days_elapsed_rpab_approval_to_nol_1: "0",
                4th_tranche_-actual_date_of_release: "",
                3rd_tranche_-_total_: "",
                1st_tranche_-actual_date_of_release: "",
                implementation_construction_-_march_2015: "",
                5th_tranche_-actual_date_of_release: "",
                under_validation: "",
                with_nol_1_-_check: "",
                implementation_construction_-_february_2015: "",
                implementation_construction_-_may_2015: "",
                subproject_stage_category: "Pipelined Subprojects",
                2nd_tranche_-lgu_equity: "",
                commodity__in_hectares_within_the_influence_area: "",
                4th_tranche_-_lgu_equity_: "",
                total_beneficiaries_non-ip: "",
                sp_cost_-_lgu_equity: "20,400,000.00",
                implementation_construction_-_june_2015: "",
                commodity_check: "",
                implementation_construction_-_december_2015: "",
                subproject_stage_-_corrected: "Proposed",
                approved_by_rpab_for_submission_to_the_pso_for_review_/_endorsement_to_the_npco_for_nol_1: "",
                sp_cost_-_gop: "20,400,000.00",
                implementation_construction_-_november_2015: "",
                implementation_construction_-_april_2015: "",
                5th_tranche_-_lgu_equity_: "",
                subproject_type_-_corrected: "Farm to Market Road (FMR)",
                no_of_household_beneficiaries: "",
                municipality_/_city: "Capas",
                quantity_check: "1",
                implementation_construction_-_july_2015: "",
                5th_tranche_-target_date_of_release: "",
                3rd_tranche_-gop_amount: "",
                actual_disbursement_cumulative-gop_amount: "",
                subproject_stage: "Under FS / DED Preparation",
                region: "Region 3",
                2nd_tranche_-lp_amount: "",
                4th_tranche_-target_date_of_release: "",
                1st_tranche_-target_date_of_release: "",
                5th_tranche_-lp_amount: "",
                2nd_tranche_-gop_amount: "",
                unit_measure: "Kilometer",
                %_of_total_cost_released_against_the_total_project_cost: "",
                1st_tranche_-lgu_equity: "",
                2nd_tranche_-target_date_of_release: "",
                2nd_tranche_-total: "",
                district: "3",
                4th_tranche_-gop_amount: "",
                days_elapsed_preparation_to_rpab_approval: "0",
                3rd_tranche_-lp_amount: "",
                implementation_construction_-_september_2015: "",
                proponent_lgu: "Province",
                re-issuance_of_nol_1: "",
                1st_tranche_-total: "",
                male_beneficiaries_non-ip: "",
                days_elapsed_validation_to_preparation: "0",
                sp_cost/kilometer: "11,724,137.93",
                target_check: "0",
                implementation_check: "",
                sp_cost_-_total: "204,000,000.00",
                3rd_tranche_-_lgu_equity_: "",
                3rd_tranche_-actual_date_of_release: "",
                5th_tranche_-gop_amount: "",
                male_beneficiaries_ip: "",
                target: "",
                under_validation_-_check: "",
                travel_time_in_road_influence_area_min_/_km_for_fmr_subproject: "",
                longitude: "",
                issuance_of_ntp: "",
                duplicate_id: "1",
                implementation_construction_-_october_2015: "",
                length_progress: "",
                total_beneficiaries_ip: "",
                cluster: "Luzon A",
                2nd_tranche_-actual_date_of_release: "",
                female_beneficiaries_non-ip: "",
                psgc_mun: "",
                3rd_tranche_-target_date_of_release: "",
                subproject_type: "Farm to Market Road (FMR)",
                issuance_of_noa: "",
                implementation_construction_-_august_2015: "",
                implementation_construction_-_january_2015: "",
                5th_tranche_-_total_: "",
                sp_cost_-_lp: "163,200,000.00",
                with_nol_1: "",
                with_nol_2: "",
                bridge_check: "",
                4th_tranche_-_total_: "",
                geofile_check: "0",
                remarks: "",
                no_of_updates: "",
                actual_disbursement_cumulative-total: "",
                1st_tranche_-gop_amount: "",
                actual_disbursement_cumulative-lp_amount: "",
                catchment_areas_of_fmr_subprojects_barangays: "",
                quantity: "17.4"
            },
            project_type: "",
            created_timestamp: 1460235882,
            id: "PRDP-IB-R003-TAR-004-000-000-2015",
            updated_timestamp: 1460427137,
            data_is_imported: "1",
            title: "Improvement of Sto. Rosario - Cutcut 2nd FMR with Bridge",
            has_classification: "0",
            agency: "DA",
            created_timestamp_utc: 1460207082,
            program: "PRDP",
            scope: "Upgrading /Expansion",
            type: "PROJECT",
            has_kml: "0",
            province: "Tarlac",
            updated: "Apr 12, 2016 02:12:17 AM",
            old_id: "PRDP-IB-R003-TAR-004-000-000-2015",
            user: {
                org_name: "",
                first_name: "Geostore",
                last_name: "Admin",
                middle_name: "",
                name: "Geostore Admin",
                designation: null,
                email_md5: "aa0ca81521db8c5357a6a72be0330465",
                org_id: "",
                region: "",
                address: {
                    province: "Metro Manila",
                    city/municipality: "City of Manila",
                    street_address: "Philippines"
                },
                operating_unit: "",
                agency: "",
                email: "geostore@sym.ph",
                office_order_number: "NONE",
                department: "",
                mobile_number: "+63 (123) 456-7890",
                salutation: "",
                uacs: "",
                id: "5629499534213120"
            },
            created: "Apr 09, 2016 09:04:42 PM",
            has_image: "0",
            permission: "PUBLIC"
        }
    ],
    method: "GET"
}
```

---


### List Subprojects

#### GET /api/v1/data?type=SUBPROJECT

List Subprojects

Parameters:

- **n** - A number. If provided, will return the number of Subprojects indicated. Defaults to 50. Maximum of 100. _*optional_
- **type** - Required. Must be set to **SUBPROJECT**
- **parent_code** - The Project Code of the parent project.
- **subproject_code** - Filter the results by the given Subproject Code _*optional_
- **program** - Filter the results by the given Program. Options are PRDP, GAA, BUB, and TRIP. _*optional_
- **csv** - Set to `1` to return results as a CSV export. _*optional_


Example: http://openroads-geostore.appspot.com/api/v1/data?type=SUBPROJECT&parent_code=R007-BOH-LOB-001-2014&n=1

Response body:

```json
{
    code: 200,
    type: "List of geostore saved data.",
    response: "OK",
    cursor: "CisSJWoNc35jb2FnZW9zdG9yZXIUCxIHQVBJRGF0YRiAgICg4JioCAwYACAA",
    data: [
        {
            status: "Complete",
            province: "Bohol",
            updated: "Dec 15, 2015 01:17:40 AM",
            code: "LOB-VIL-001",
            title: "Villadolid",
            type: "SUBPROJECT",
            agency: "DA",
            municipality: "Loboc",
            created_timestamp_utc: 1450113460,
            created: "Dec 15, 2015 01:17:40 AM",
            coa: "1",
            program: "PRDP",
            updated_timestamp: 1450142260,
            user: {
                org_name: "",
                first_name: "RU Jan",
                last_name: "Gazo",
                middle_name: "Regular User",
                name: "RU Jan Gazo",
                designation: null,
                email_md5: "df2e7e6026c26d8b50256d4babd8b56b",
                org_id: "",
                region: "",
                address: {
                    province: "Cebu",
                    city/municipality: "Cebu City",
                    street_address: "Talamban"
                },
                operating_unit: "",
                agency: "",
                email: "jan+geostore@sym.ph",
                office_order_number: "NONE",
                department: "",
                mobile_number: "+63 (987) 654-3210",
                salutation: "",
                uacs: "",
                id: "5659711005261824"
            },
            project_type: "Barangay Roads",
            created_timestamp: 1450142260,
            permission: "PUBLIC",
            updated_timestamp_utc: 1450113460,
            data: "",
            id: "4680371958448128",
            parent_code: "R007-BOH-LOB-001-2014"
        }
    ],
    method: "GET"
}
```

---


### List Datasets

#### GET /api/v1/data?type=DATASET

List Datasets. A dataset is a container of KML Files, Images, and other uploaded files or documents.

Parameters:

- **n** - A number. If provided, will return the number of Datasets indicated. Defaults to 50. Maximum of 100. _*optional_
- **type** - Required. Must be set to **DATASET**
- **parent_code** - Filter the results by the given Project Code or Subproject Code. _*optional_
- **program** - Filter the results by the given Program. Options are PRDP, GAA, BUB, and TRIP. _*optional_
- **csv** - Set to `1` to return results as a CSV export. _*optional_


Example: http://openroads-geostore.appspot.com/api/v1/data?type=DATASET&parent_code=FMRDP-ROO6-ILO-LEG-001-2014

Response body:

```json
{
    code: 200,
    type: "List of geostore saved data.",
    response: "OK",
    cursor: "",
    data: [
        {
            updated_timestamp: 1447105071,
            updated: "Nov 09, 2015 09:37:51 PM",
            code: "0DDC41CE-8D88-4722-ABD8-005527259569",
            title: "Concreting of Brgy. Calaboa FMR",
            agency: "DPWH",
            created_timestamp_utc: 1447076271,
            created: "Nov 09, 2015 09:37:51 PM",
            program: "GAA",
            user: {
                org_name: "",
                first_name: "Geostore",
                last_name: "Admin",
                middle_name: "",
                name: "Geostore Admin",
                designation: null,
                email_md5: "aa0ca81521db8c5357a6a72be0330465",
                org_id: "",
                region: "",
                address: {
                    province: "Cebu",
                    city/municipality: "Cebu City",
                    street_address: "Cebu City, Philippines"
                },
                operating_unit: "",
                agency: "",
                email: "geostore@sym.ph",
                office_order_number: "NONE",
                department: "",
                mobile_number: "",
                salutation: "",
                uacs: "",
                id: "5394598109118464"
            },
            created_timestamp: 1447105071,
            permission: "PUBLIC",
            updated_timestamp_utc: 1447076271,
            type: "DATASET",
            id: "4543571545817088",
            parent_code: "FMRDP-ROO6-ILO-LEG-001-2014"
        }
    ],
    method: "GET"
}
```

---


### List Images

#### GET /api/v1/data?type=IMAGE

List Images

Parameters:

- **n** - A number. If provided, will return the number of Images indicated. Defaults to 50. Maximum of 100. _*optional_
- **type** - Required. Must be set to **IMAGE**
- **parent_code** - The Dataset Code of the parent dataset.
- **project_code** - Filter the results by the given Project Code _*optional_
- **subproject_code** - Filter the results by the given Subproject Code _*optional_
- **program** - Filter the results by the given Program. Options are PRDP, GAA, BUB, and TRIP. _*optional_
- **csv** - Set to `1` to return results as a CSV export. _*optional_


Example: http://openroads-geostore.appspot.com/api/v1/data?type=IMAGE&parent_code=1591CEF7-C44A-4420-80CF-F4E932D42FEB&n=2

Response body:

```json
{
    code: 200,
    type: "List of geostore saved data.",
    response: "OK",
    cursor: "CisSJWoNc35jb2FnZW9zdG9yZXIUCxIHQVBJRGF0YRiAgICA55-ACAwYACAA",
    data: [
        {
            user: {
                org_name: "",
                first_name: "Geostore",
                last_name: "Admin",
                middle_name: "",
                name: "Geostore Admin",
                designation: null,
                email_md5: "aa0ca81521db8c5357a6a72be0330465",
                org_id: "",
                region: "",
                address: {
                    province: "Cebu",
                    city/municipality: "Cebu City",
                    street_address: "Cebu City, Philippines"
                },
                operating_unit: "",
                agency: "",
                email: "geostore@sym.ph",
                office_order_number: "NONE",
                department: "",
                mobile_number: "",
                salutation: "",
                uacs: "",
                id: "5394598109118464"
            },
            updated_timestamp: 1447281202,
            updated: "Nov 11, 2015 10:33:22 PM",
            created_timestamp_utc: 1447252402,
            created: "Nov 11, 2015 10:33:22 PM",
            latlng: "10.9896874,123.9570261",
            agency: "DA",
            updated_timestamp_utc: 1447252402,
            project_code: "PRDP-IB-R007-CEB-001-000-000-2014",
            created_timestamp: 1447281202,
            program: "PRDP",
            original_file_url: "http://storage.googleapis.com/coageostore/uploads/8KPlUVmIcc6ip4Bw2mdvzGgLDTsF4m4mYwFpJBZSkpGLKqESsrFULmPDiieBw3Qa4Wip80srnUXoLTGBaetF0o3NDtNOzAI6wpNtZixY9QLfsUBVa1bfbFAoe1i6CEme/PRPD_IMG_11262014_023526%20PM.jpg",
            image: {
                file_url: "http://storage.googleapis.com/coageostore/uploads/8KPlUVmIcc6ip4Bw2mdvzGgLDTsF4m4mYwFpJBZSkpGLKqESsrFULmPDiieBw3Qa4Wip80srnUXoLTGBaetF0o3NDtNOzAI6wpNtZixY9QLfsUBVa1bfbFAoe1i6CEme/PRPD_IMG_11262014_023526%20PM.jpg",
                serving_url: "http://lh3.googleusercontent.com/ik7CZ1AT42EZMOSnzKdSDsnWv82lWQ0BuNmL_LowTid7HqCErJs9OngLHXA3XUM-X-PqRJBjlyvv1rSyZpFl1-M"
            },
            date: "2012:01:01 04:23:00",
            permission: "PUBLIC",
            type: "IMAGE",
            id: "4504117439365120",
            parent_code: "1591CEF7-C44A-4420-80CF-F4E932D42FEB"
        },
        {
            user: {
                org_name: "",
                first_name: "Geostore",
                last_name: "Admin",
                middle_name: "",
                name: "Geostore Admin",
                designation: null,
                email_md5: "aa0ca81521db8c5357a6a72be0330465",
                org_id: "",
                region: "",
                address: {
                    province: "Cebu",
                    city/municipality: "Cebu City",
                    street_address: "Cebu City, Philippines"
                },
                operating_unit: "",
                agency: "",
                email: "geostore@sym.ph",
                office_order_number: "NONE",
                department: "",
                mobile_number: "",
                salutation: "",
                uacs: "",
                id: "5394598109118464"
            },
            updated_timestamp: 1447281696,
            updated: "Nov 11, 2015 10:41:36 PM",
            created_timestamp_utc: 1447252896,
            created: "Nov 11, 2015 10:41:36 PM",
            latlng: "10.9817519,123.9595025",
            agency: "DA",
            updated_timestamp_utc: 1447252896,
            project_code: "PRDP-IB-R007-CEB-001-000-000-2014",
            created_timestamp: 1447281696,
            program: "PRDP",
            original_file_url: "http://storage.googleapis.com/coageostore/uploads/uCCkh3tq6qxqLaEOztLQWs6RuDouscoupqQWgn4XpwztnaJt9TGkHocbRZr0p96JfTI8BI8V4KAqVsooffx0GJThaYZ1p4arp8tZSw2z8e3dHg0TweDWqqPtUq0ILPrQ/PRPD_IMG_10232014_021115%20PM.jpg",
            image: {
                file_url: "http://storage.googleapis.com/coageostore/uploads/uCCkh3tq6qxqLaEOztLQWs6RuDouscoupqQWgn4XpwztnaJt9TGkHocbRZr0p96JfTI8BI8V4KAqVsooffx0GJThaYZ1p4arp8tZSw2z8e3dHg0TweDWqqPtUq0ILPrQ/PRPD_IMG_10232014_021115%20PM.jpg",
                serving_url: "http://lh3.googleusercontent.com/aydNeLQXXGkbJep5mc5Ekc31JweRnt4hon6nyXVzHng-agVvuaU8Q-6bjlGHWlDn6qwYmAxAHBrTRbFb2djH9pE"
            },
            date: "2014:10:23 06:12:00",
            permission: "PUBLIC",
            type: "IMAGE",
            id: "4504692428111872",
            parent_code: "1591CEF7-C44A-4420-80CF-F4E932D42FEB"
        }
    ],
    method: "GET"
}
```

---


### List KML

#### GET /api/v1/data?type=KML

List KMLs

Parameters:

- **n** - A number. If provided, will return the number of KMLs indicated. Defaults to 50. Maximum of 100. _*optional_
- **type** - Required. Must be set to **KML**
- **parent_code** - The Dataset Code of the parent dataset.
- **project_code** - Filter the results by the given Project Code _*optional_
- **subproject_code** - Filter the results by the given Subproject Code _*optional_
- **program** - Filter the results by the given Program. Options are PRDP, GAA, BUB, and TRIP. _*optional_
- **csv** - Set to `1` to return results as a CSV export. _*optional_


Example: http://openroads-geostore.appspot.com/api/v1/data?type=IMAGE&parent_code=1591CEF7-C44A-4420-80CF-F4E932D42FEB&n=2

Response body:

```json
{
    code: 200,
    type: "List of geostore saved data.",
    response: "OK",
    cursor: "CisSJWoNc35jb2FnZW9zdG9yZXIUCxIHQVBJRGF0YRiAgICgzLWDCAwYACAA",
    data: [
        {
            updated_timestamp: 1450070179,
            updated: "Dec 14, 2015 05:16:19 AM",
            kml: {
                file_url: "http://storage.googleapis.com/coageostore/uploads/rnv6hLsMBiQe0BzXMiExgJ6u2NWCAXVsc3y23izADH0CVzyCaqvJAapIwyVcRUe2v6i3VM3xSEm06VEm3iqKtZzhYKdwTUt4Cv3D9QTbuGmfAzVqQgKjGRc1m5XKgRG7/2013-XIII-07.kml",
                serving_url: "http://storage.googleapis.com/coageostore/uploads/rnv6hLsMBiQe0BzXMiExgJ6u2NWCAXVsc3y23izADH0CVzyCaqvJAapIwyVcRUe2v6i3VM3xSEm06VEm3iqKtZzhYKdwTUt4Cv3D9QTbuGmfAzVqQgKjGRc1m5XKgRG7/2013-XIII-07.kml"
            },
            created: "Dec 14, 2015 05:16:19 AM",
            user: {
                org_name: "",
                first_name: "Geostore",
                last_name: "Admin",
                middle_name: "",
                name: "Geostore Admin",
                designation: null,
                email_md5: "aa0ca81521db8c5357a6a72be0330465",
                org_id: "",
                region: "",
                address: {
                    province: "Cebu",
                    city/municipality: "Cebu City",
                    street_address: "Cebu City, Philippines"
                },
                operating_unit: "",
                agency: "",
                email: "geostore@sym.ph",
                office_order_number: "NONE",
                department: "",
                mobile_number: "",
                salutation: "",
                uacs: "",
                id: "5394598109118464"
            },
            agency: "DOT",
            created_timestamp_utc: 1450041379,
            project_code: "2013-XIII-07",
            program: "TRIP",
            original_file_url: "http://storage.googleapis.com/coageostore/uploads/rnv6hLsMBiQe0BzXMiExgJ6u2NWCAXVsc3y23izADH0CVzyCaqvJAapIwyVcRUe2v6i3VM3xSEm06VEm3iqKtZzhYKdwTUt4Cv3D9QTbuGmfAzVqQgKjGRc1m5XKgRG7/2013-XIII-07.kml",
            created_timestamp: 1450070179,
            permission: "PUBLIC",
            updated_timestamp_utc: 1450041379,
            type: "KML",
            id: "4505481494134784",
            parent_code: "8F27F418-81BA-4BED-9A42-D77967C03557"
        },
        {
            updated_timestamp: 1450070738,
            updated: "Dec 14, 2015 05:25:38 AM",
            kml: {
                file_url: "http://storage.googleapis.com/coageostore/uploads/P6pGBxIRyDKslWAH5qZ5fbumvBfgW7cQZ1I7IPjpDUaUYsWGdW3MhyXGtMFaImxKEiaVwMIiJFHGkKapgP5wstUJgIdzOQ0bV2iFqzCG0Ut7MYJ0A9f9L8tvZTuyyOxl/2015-XII-12.kml",
                serving_url: "http://storage.googleapis.com/coageostore/uploads/P6pGBxIRyDKslWAH5qZ5fbumvBfgW7cQZ1I7IPjpDUaUYsWGdW3MhyXGtMFaImxKEiaVwMIiJFHGkKapgP5wstUJgIdzOQ0bV2iFqzCG0Ut7MYJ0A9f9L8tvZTuyyOxl/2015-XII-12.kml"
            },
            created: "Dec 14, 2015 05:25:38 AM",
            user: {
                org_name: "",
                first_name: "Geostore",
                last_name: "Admin",
                middle_name: "",
                name: "Geostore Admin",
                designation: null,
                email_md5: "aa0ca81521db8c5357a6a72be0330465",
                org_id: "",
                region: "",
                address: {
                    province: "Cebu",
                    city/municipality: "Cebu City",
                    street_address: "Cebu City, Philippines"
                },
                operating_unit: "",
                agency: "",
                email: "geostore@sym.ph",
                office_order_number: "NONE",
                department: "",
                mobile_number: "",
                salutation: "",
                uacs: "",
                id: "5394598109118464"
            },
            agency: "DOT",
            created_timestamp_utc: 1450041938,
            project_code: "2015-XII-12",
            program: "TRIP",
            original_file_url: "http://storage.googleapis.com/coageostore/uploads/P6pGBxIRyDKslWAH5qZ5fbumvBfgW7cQZ1I7IPjpDUaUYsWGdW3MhyXGtMFaImxKEiaVwMIiJFHGkKapgP5wstUJgIdzOQ0bV2iFqzCG0Ut7MYJ0A9f9L8tvZTuyyOxl/2015-XII-12.kml",
            created_timestamp: 1450070738,
            permission: "PUBLIC",
            updated_timestamp_utc: 1450041938,
            type: "KML",
            id: "4518635301240832",
            parent_code: "28A6AC1A-7CF3-4290-912F-D991692FDE1A"
        }
    ],
    method: "GET"
}
```

---


### List Classifications

#### GET /api/v1/data?type=CLASSIFICATION

List Classifications created by Geoprocessing Images.

Parameters:

- **n** - A number. If provided, will return the number of classifications indicated. Defaults to 50. Maximum of 100. _*optional_
- **type** - Required. Must be set to **CLASSIFICATION**
- **parent_code** - The Dataset Code of the parent dataset.
- **project_code** - Filter the results by the given Project Code. _*optional_
- **image_id** - Filter the results by the given Image ID. _*optional_
- **classification_type** - Filter the results by classification type. Set to `SURFACE` or `QUALITY`. _*optional_
- **classification** - Filter the results by the classification value. Options are CONCRETE, ASPHALT, GRAVEL, EARTH, GOOD, FAIR, POOR, or BAD. _*optional_
- **image_id** - Filter the results by the given Image ID. _*optional_
- **program** - Filter the results by the given Program. Options are PRDP, GAA, BUB, and TRIP. _*optional_
- **csv** - Set to `1` to return results as a CSV export. _*optional_


Example: http://openroads-geostore.appspot.com/api/v1/data?type=IMAGE&parent_code=1591CEF7-C44A-4420-80CF-F4E932D42FEB&n=2

Response body:

```json
{
    code: 200,
    type: "List of geostore saved data.",
    response: "OK",
    cursor: "CisSJWoNc35jb2FnZW9zdG9yZXIUCxIHQVBJRGF0YRiAgICgrtOACAwYACAA",
    data: [
        {
            updated_timestamp: 1450287270,
            updated: "Dec 16, 2015 05:34:30 PM",
            classification: "GRAVEL",
            created: "Dec 16, 2015 05:34:30 PM",
            image_serving_url: "http://lh3.googleusercontent.com/85_LdSHWrO57DKqqP-FcSzGIoRVCSCpVzNLE1y77RkjWGk6p8uET2bin-sHYEJ3GpA5gp6jhfIY4Qe7TPQpT7g",
            created_timestamp_utc: 1450258470,
            classification_type: "SURFACE",
            updated_timestamp_utc: 1450258470,
            is_road: "1",
            project_code: "FMRDP-ROO8-LEY-MER-003-2015",
            permission: "PUBLIC",
            image_id: "6466328814682112",
            created_timestamp: 1450287270,
            image_url: "http://storage.googleapis.com/coageostore/uploads/6bZT4AFn8672iNUM8zeYcUX3j5xspvydhZylWxtPM9VvOk2DgvpI5g94k2y0QcyGU75OkyBpS3HpTbLnbrp7MLyWzi6lZkwxSXrlPSBFTv92cqm4Z87U94Sih9FAZUID/20150304_132845.jpg",
            user: {
                org_name: "",
                first_name: "Ashley",
                last_name: "Uy",
                middle_name: "",
                name: "Ashley Uy",
                designation: null,
                email_md5: "9d11a7b7814f2427e5bd44c592fbb6aa",
                org_id: "",
                region: "",
                address: {
                    province: "Cebu",
                    city/municipality: "Cebu City",
                    street_address: "#350-T V. Urgellio St, Sambag 2"
                },
                operating_unit: "",
                agency: "",
                email: "ashley@sym.ph",
                office_order_number: "NONE",
                department: "",
                mobile_number: "",
                salutation: "",
                uacs: "",
                id: "5720630016081920"
            },
            lat: "10.932572",
            lng: "124.50019",
            type: "CLASSIFICATION",
            id: "4505709328728064",
            parent_code: "2B7982C4-6D1A-4546-909F-92091DDBEE8D"
        },
        {
            updated_timestamp: 1450287226,
            updated: "Dec 16, 2015 05:33:46 PM",
            classification: "GOOD",
            created: "Dec 16, 2015 05:33:46 PM",
            image_serving_url: "http://lh3.googleusercontent.com/rad-7huEwq-3t0w4_QrHz15auC2f-B1Jktb0kFqZEhZZo5LUZF1baj-LvJIvarkpXgtLXTjc_A314ATIjhUDuXOG",
            created_timestamp_utc: 1450258426,
            classification_type: "QUALITY",
            updated_timestamp_utc: 1450258426,
            is_road: "1",
            project_code: "FMRDP-ROO8-LEY-MER-003-2015",
            permission: "PUBLIC",
            image_id: "6018492843163648",
            created_timestamp: 1450287226,
            image_url: "http://storage.googleapis.com/coageostore/uploads/RUlXVNc8mpj3hQ5DTvAD9YBOp7nYrmr1q7RxK7DLLpoI6twY9iipzWe1qclJxaxzU1CeVkYSUUWori8zyRJiWz9l2tZ3Z65E3Q8o42GwTvULUiidxr2bWlzWrN1faVo5/20150304_142616.jpg",
            user: {
                org_name: "",
                first_name: "Ashley",
                last_name: "Uy",
                middle_name: "",
                name: "Ashley Uy",
                designation: null,
                email_md5: "9d11a7b7814f2427e5bd44c592fbb6aa",
                org_id: "",
                region: "",
                address: {
                    province: "Cebu",
                    city/municipality: "Cebu City",
                    street_address: "#350-T V. Urgellio St, Sambag 2"
                },
                operating_unit: "",
                agency: "",
                email: "ashley@sym.ph",
                office_order_number: "NONE",
                department: "",
                mobile_number: "",
                salutation: "",
                uacs: "",
                id: "5720630016081920"
            },
            lat: "10.90803",
            lng: "124.537704",
            type: "CLASSIFICATION",
            id: "4506463900794880",
            parent_code: "2B7982C4-6D1A-4546-909F-92091DDBEE8D"
        }
    ],
    method: "GET"
}
```
