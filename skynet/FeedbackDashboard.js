import React from 'react';
import { Text, View } from 'react-native';
import { useCloudValue } from '../cloud-core/KiteReact';
import GenericPage from '../maui-web/GenericPage';
import Container from '../dashboard/Container';
import Button from '../dashboard/Button';

function openCSVdata(dataStr, name) {
  let csvContent = 'data:text/csv;charset=utf-8,' + dataStr;

  var encodedUri = encodeURI(csvContent);
  var link = window.document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', name + '.csv');
  window.document.body.appendChild(link); // Required for FF

  link.click();
}

export default function FeedbackDashboard({}) {
  const summary = useCloudValue('FeedbackSummary');
  function downloadCSV() {
    const allFeedbacks = [];
    Object.values(summary.allFeedback).forEach(feedbackDay => {
      feedbackDay.feedbacks.forEach(f => allFeedbacks.push(f));
    });
    let csvData = 'time,rating,tags,email';
    allFeedbacks.forEach(feedback => {
      csvData += `
${String(new Date(feedback.time))},${feedback.rating},${feedback.tags.join(
        ' ',
      )},${feedback.email}`;
    });
    openCSVdata(csvData, 'CustomerFeedback');
  }
  if (!summary) {
    return (
      <GenericPage>
        <Text style={{ fontWeight: 'bold', fontSize: 32, color: '#333' }}>
          loading..
        </Text>
      </GenericPage>
    );
  }
  return (
    <GenericPage>
      <Container>
        <Text style={{ fontWeight: 'bold', fontSize: 32, color: '#333' }}>
          {summary.feedbackCount} feedback entries
        </Text>
        {Object.entries(summary.allFeedback).map(([dayString, day]) => {
          let ratingSums = { ...day.sums };
          delete ratingSums.rating;
          return (
            <View>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 24,
                  color: '#333',
                  marginTop: 32,
                }}
              >
                {dayString}
              </Text>
              <Text style={{ fontSize: 18, color: '#333' }}>
                {day.dayCount} entries
              </Text>
              <Text style={{ fontSize: 18, color: '#333' }}>
                Average rating:
                {day.sums.rating / day.dayCount}
              </Text>
              {Object.entries(ratingSums).map(([ratingName, sum]) => (
                <Text style={{ fontSize: 18, color: '#333' }}>
                  {ratingName}: {sum}
                </Text>
              ))}
            </View>
          );
        })}
        <Button title="Download CSV" onPress={downloadCSV} />
      </Container>
    </GenericPage>
  );
}

FeedbackDashboard.navigationOptions = {
  title: 'Feedback Dashboard',
};
