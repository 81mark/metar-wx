import React from 'react';
import moment from 'moment';

const MetarReport = ({ cat, data }) => {
	return (
		<div
			className={
				(cat === 'VFR' && 'card text-white bg-success mb-3') ||
				(cat === 'MVFR' && 'card text-white bg-primary mb-3') ||
				(cat === 'IFR' && 'card text-white bg-danger mb-3') ||
				(cat === 'LIFR' && 'card text-white bg-info mb-3')
			}
		>
			<div className='card-body'>
				<h4 className='card-title'>
					{data.icao} <strong>{cat}</strong>
					<span className='taf-link small text-uppercase float-right'></span>
					<span className='float-right'> Metar</span>
				</h4>
				<p className='card-text'>
					{data.station.name} Airport
					<br />
					Airfield Elevation: {data.elevation.feet} feet
				</p>
				<p>Visibility: {data.visibility.meters} meters</p>
				<p>Pressure: {data.barometer.hpa} Hpa</p>
				<hr />
				{!data.wind ? (
					<p>No Wind</p>
				) : (
					<>
						<p>
							Wind is {data.wind.degrees}&deg; at {data.wind.speed_kts} kts
						</p>
					</>
				)}
				<hr />
				<h3 className='text-center'>Temperature</h3>
				<h4 className='text-center'>{data.temperature.celsius}&deg;c</h4>
				<h3 className='text-center'>Dewpoint</h3>
				<h4 className='text-center'>{data.dewpoint.celsius}&deg;c</h4>
			</div>
			<div className='card-footer text-dark small font-weight-bold'>
				Observed at
				{moment(new Date(data.observed)).format(' h:mm:a on DD/MM/YYYY')}
			</div>
		</div>
	);
};

export default MetarReport;
